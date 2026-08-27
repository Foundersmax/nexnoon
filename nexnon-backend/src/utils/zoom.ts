import axios from 'axios';
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
 * If Zoom env vars are missing, this returns a mocked meeting URL so the rest
 * of the app can still function in development/demo mode.
 */
export const createZoomMeeting = async (
  input: CreateZoomMeetingInput
): Promise<ZoomMeeting> => {
  const { ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET } = ENV;

  if (!ZOOM_ACCOUNT_ID || !ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET) {
    // Fallback: demo Zoom link
    return {
      join_url: 'https://zoom.us/j/1234567890?pwd=demo',
      id: 'demo-meeting-id',
      password: 'demo-passcode',
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


