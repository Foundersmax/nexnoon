import axios from 'axios';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';

interface CreateZoomMeetingInput {
  topic: string;
  startTime: string;
  durationMinutes: number;
}

export interface ZoomMeeting {
  join_url: string;
  id: string | number;
  password?: string;
}

/**
 * Lightweight Zoom integration.
 * If Zoom env vars are missing, this returns empty meeting details so the rest
 * of the app can still function in development/demo mode.
 */
export const createZoomMeeting = async (
  input: CreateZoomMeetingInput
): Promise<ZoomMeeting> => {
  const { ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET } = ENV;

  if (!ZOOM_ACCOUNT_ID || !ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET) {
    // No fabricated meeting details when Zoom is not configured.
    return {
      join_url: '',
      id: '',
      password: '',
    };
  }

  // Get OAuth access token using Server-to-Server OAuth (Zoom)
  const tokenResponse = await axios.post(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
    undefined,
    {
      auth: {
        username: ZOOM_CLIENT_ID,
        password: ZOOM_CLIENT_SECRET,
      },
    }
  );

  const accessToken = tokenResponse.data.access_token as string;

  const meetingResponse = await axios.post<ZoomMeeting>(
    'https://api.zoom.us/v2/users/me/meetings',
    {
      topic: input.topic,
      type: 2, // scheduled
      start_time: input.startTime,
      duration: input.durationMinutes,
      settings: {
        join_before_host: false,
        approval_type: 0,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return meetingResponse.data;
};

export interface ZoomMeetingSDKSignatureInput {
  meetingNumber: string | number;
  role?: 0 | 1;
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
    role: input.role ?? 0,
    iat: timestamp,
    exp: expirationTime,
  };

  return jwt.sign(payload, ZOOM_MEETING_SDK_CLIENT_SECRET, { algorithm: 'HS256' });
};
