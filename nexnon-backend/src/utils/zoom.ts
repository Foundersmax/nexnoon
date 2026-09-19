import axios from 'axios';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';

const REQUEST_TIMEOUT_MS = 8000;

interface CreateZoomMeetingInput {
  topic: string;
  startTime: string;
  durationMinutes: number;
  /**
   * Zoom user ID or email to host this meeting under (an instructor's mapped Zoom
   * user). Falls back to the Server-to-Server OAuth app's own user ("me") when not
   * provided, preserving pre-existing sessions created before per-instructor mapping.
   */
  hostIdentifier?: string;
}

export interface ZoomMeeting {
  join_url: string;
  id: string | number;
  password?: string;
  start_url?: string;
  host_id?: string;
}

/**
 * Fetches a Server-to-Server OAuth access token for the platform's shared Zoom
 * account. Returns null when Zoom is not configured (demo mode).
 */
export const getZoomAccessToken = async (): Promise<string | null> => {
  const { ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET } = ENV;

  if (!ZOOM_ACCOUNT_ID || !ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET) {
    return null;
  }

  const tokenResponse = await axios.post(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
    undefined,
    {
      auth: {
        username: ZOOM_CLIENT_ID,
        password: ZOOM_CLIENT_SECRET,
      },
      timeout: REQUEST_TIMEOUT_MS,
    }
  );

  return tokenResponse.data.access_token as string;
};

/**
 * Lightweight Zoom integration.
 * If Zoom env vars are missing, this returns empty meeting details so the rest
 * of the app can still function in development/demo mode.
 *
 * Meeting settings only use fields documented in the Zoom Meetings API "Create a
 * meeting" reference: waiting_room, join_before_host, mute_upon_entry,
 * participant_video, host_video, approval_type. Restricting participant screen
 * share is not a meeting-create field in that API - it's an account/group-level
 * "who can share screen" policy or an in-meeting host control - so it is not set
 * here; hosts control it live via Zoom's native controls.
 */
export const createZoomMeeting = async (
  input: CreateZoomMeetingInput
): Promise<ZoomMeeting> => {
  const accessToken = await getZoomAccessToken();

  if (!accessToken) {
    // No fabricated meeting details when Zoom is not configured.
    return {
      join_url: '',
      id: '',
      password: '',
    };
  }

  const hostPathSegment = input.hostIdentifier ? encodeURIComponent(input.hostIdentifier) : 'me';

  const meetingResponse = await axios.post<ZoomMeeting>(
    `https://api.zoom.us/v2/users/${hostPathSegment}/meetings`,
    {
      topic: input.topic,
      type: 2, // scheduled
      start_time: input.startTime,
      duration: input.durationMinutes,
      settings: {
        waiting_room: true,
        join_before_host: false,
        mute_upon_entry: true,
        participant_video: false,
        host_video: true,
        approval_type: 0,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      timeout: REQUEST_TIMEOUT_MS,
    }
  );

  return meetingResponse.data;
};

/**
 * Updates a previously-created meeting's scheduled time on Zoom's side (e.g. when
 * an instructor reschedules a session), so Zoom's own record (calendar invite,
 * meeting list) matches. A no-op in demo mode. Does not affect our own join-window
 * check, which reads the session's stored start/end time directly.
 */
export const updateZoomMeeting = async (
  meetingId: string,
  input: { startTime: string; durationMinutes: number }
): Promise<void> => {
  const accessToken = await getZoomAccessToken();
  if (!accessToken) return;

  await axios.patch(
    `https://api.zoom.us/v2/meetings/${meetingId}`,
    {
      start_time: input.startTime,
      duration: input.durationMinutes,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      timeout: REQUEST_TIMEOUT_MS,
    }
  );
};

/**
 * Fetches a fresh start_url for an existing meeting (Zoom start URLs embed a
 * short-lived token). Used only by the protected instructor host-access route;
 * never logged, never returned from any other endpoint. Returns null in demo mode
 * or on any Zoom API failure so callers can fail safely.
 */
export const getZoomMeetingStartUrl = async (meetingId: string): Promise<string | null> => {
  const accessToken = await getZoomAccessToken();
  if (!accessToken) return null;

  try {
    const response = await axios.get<{ start_url?: string }>(
      `https://api.zoom.us/v2/meetings/${meetingId}`,
      { headers: { Authorization: `Bearer ${accessToken}` }, timeout: REQUEST_TIMEOUT_MS }
    );
    return response.data.start_url || null;
  } catch {
    return null;
  }
};

export interface ZoomMeetingSDKSignatureInput {
  meetingNumber: string | number;
  /**
   * Participant role only (0). Embedded host role (1) / ZAK-based host joining is
   * intentionally not supported - instructors host through Zoom's native start-URL
   * experience (see the host-access route), not the Meeting SDK.
   */
  role?: 0;
}

export const generateZoomMeetingSDKSignature = (
  input: ZoomMeetingSDKSignatureInput
): string => {
  const { ZOOM_MEETING_SDK_CLIENT_ID, ZOOM_MEETING_SDK_CLIENT_SECRET } = ENV;

  if (!ZOOM_MEETING_SDK_CLIENT_ID || !ZOOM_MEETING_SDK_CLIENT_SECRET) {
    throw new Error('Zoom Meeting SDK credentials not configured');
  }

  const expirationSeconds = 60 * 60; // 1 hour
  const timestamp = Math.floor(Date.now() / 1000);
  const expirationTime = timestamp + expirationSeconds;

  const payload = {
    appKey: ZOOM_MEETING_SDK_CLIENT_ID,
    mn: input.meetingNumber.toString(),
    role: 0,
    iat: timestamp,
    exp: expirationTime,
  };

  return jwt.sign(payload, ZOOM_MEETING_SDK_CLIENT_SECRET, { algorithm: 'HS256' });
};

const WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS = 5 * 60;

/**
 * Verifies a Zoom webhook delivery per Zoom's documented signature scheme:
 * HMAC-SHA256 over `v0:{timestamp}:{rawBody}` using the webhook secret token,
 * compared as `v0={hex}`. Also rejects stale timestamps (replay protection).
 */
export const verifyZoomWebhookSignature = (params: {
  rawBody: string;
  signatureHeader: string | undefined;
  timestampHeader: string | undefined;
}): boolean => {
  const { rawBody, signatureHeader, timestampHeader } = params;
  if (!ENV.ZOOM_WEBHOOK_SECRET_TOKEN || !signatureHeader || !timestampHeader) return false;

  const timestampSeconds = Number(timestampHeader);
  if (!Number.isFinite(timestampSeconds)) return false;
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - timestampSeconds) > WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS) return false;

  const message = `v0:${timestampHeader}:${rawBody}`;
  const expected = `v0=${crypto
    .createHmac('sha256', ENV.ZOOM_WEBHOOK_SECRET_TOKEN)
    .update(message)
    .digest('hex')}`;

  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(signatureHeader);
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
};

/**
 * Zoom's endpoint-URL-validation challenge: HMAC-SHA256 of the plainToken using
 * the webhook secret token, returned so Zoom can confirm this endpoint controls it.
 */
export const hashZoomWebhookValidationToken = (plainToken: string): string => {
  return crypto.createHmac('sha256', ENV.ZOOM_WEBHOOK_SECRET_TOKEN).update(plainToken).digest('hex');
};
