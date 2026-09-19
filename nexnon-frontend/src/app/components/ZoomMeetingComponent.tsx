import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import type { ClassSchedule } from '@/types/api';

interface ZoomMeetingComponentProps {
  classId: string;
  session: ClassSchedule;
  userName: string;
}

type JoinState = 'waiting' | 'loading' | 'ready' | 'error';
type ErrorReason = 'too-early' | 'not-enrolled' | 'unauthenticated' | 'cancelled' | 'missing-meeting' | 'sdk-config' | 'signature-failed' | 'init-failed' | 'network' | 'meeting-ended';

export default function ZoomMeetingComponent({ classId, session, userName }: ZoomMeetingComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<JoinState>('waiting');
  const [error, setError] = useState<ErrorReason | null>(null);
  const [countdown, setCountdown] = useState<string>('');

  // Update countdown
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const startTime = new Date(session.startTime).getTime();
      const timeUntilStart = startTime - now;
      const fifteenMinutes = 15 * 60 * 1000;

      if (timeUntilStart > fifteenMinutes) {
        const hours = Math.floor(timeUntilStart / (1000 * 60 * 60));
        const minutes = Math.floor((timeUntilStart % (1000 * 60 * 60)) / (1000 * 60));
        setCountdown(`Starts in ${hours}h ${minutes}m`);
      } else if (timeUntilStart > 0) {
        const minutes = Math.floor(timeUntilStart / (1000 * 60));
        const seconds = Math.floor((timeUntilStart % (1000 * 60)) / 1000);
        setCountdown(`Ready to join in ${minutes}m ${seconds}s`);
      } else {
        setCountdown('');
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [session.startTime]);

  // Check if too early and set error
  useEffect(() => {
    const now = Date.now();
    const startTime = new Date(session.startTime).getTime();
    const fifteenMinutes = 15 * 60 * 1000;

    if (now < startTime - fifteenMinutes && state === 'waiting') {
      setError('too-early');
    }
  }, [session.startTime, state]);

  const handleJoinMeeting = async () => {
    setState('loading');
    setError(null);

    try {
      // Request credentials from backend
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/classes/${classId}/sessions/${session.id}/join-credentials`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
      );

      if (!response.data.success) {
        const message = response.data.message || 'Unable to join meeting';
        if (message.includes('not started')) {
          setError('too-early');
        } else if (message.includes('not enrolled')) {
          setError('not-enrolled');
        } else if (message.includes('cancelled') || message.includes('completed')) {
          setError('cancelled');
        } else if (message.includes('not available')) {
          setError('missing-meeting');
        } else if (message.includes('not configured')) {
          setError('sdk-config');
        } else {
          setError('network');
        }
        setState('error');
        return;
      }

      const { signature, meetingNumber, passWord, userName: displayName, userEmail } = response.data.data;

      // Load the Zoom Meeting SDK on demand so it never bloats routes that don't join a meeting
      const { ZoomMtg } = await import('@zoom/meetingsdk');
      ZoomMtg.setZoomJSLib('https://source.zoom.us/2.13.0/zm.js', '/zmutil/');
      ZoomMtg.preLoadWasm();

      try {
        await ZoomMtg.init({
          leaveUrl: `${window.location.origin}/my-classes`,
          success: () => {
            if (!containerRef.current) {
              setError('init-failed');
              setState('error');
              return;
            }

            ZoomMtg.join({
              signature,
              meetingNumber,
              passWord,
              userName: displayName || userName,
              userEmail: userEmail || '',
              success: () => {
                setState('ready');
              },
              error: (error: any) => {
                console.error('Zoom join error:', error);
                if (error?.toString?.().includes('ended')) {
                  setError('meeting-ended');
                } else {
                  setError('init-failed');
                }
                setState('error');
              },
            });
          },
          error: (error: any) => {
            console.error('Zoom init error:', error);
            setError('init-failed');
            setState('error');
          },
        });
      } catch (initError) {
        console.error('SDK initialization failed:', initError);
        setError('init-failed');
        setState('error');
      }
    } catch (err: any) {
      console.error('Request failed:', err);
      if (err.response?.status === 401) {
        setError('unauthenticated');
      } else if (err.response?.status === 409) {
        const message = err.response.data?.message || '';
        if (message.includes('not started')) {
          setError('too-early');
        } else if (message.includes('cancelled') || message.includes('completed')) {
          setError('cancelled');
        } else {
          setError('missing-meeting');
        }
      } else if (err.response?.status === 403) {
        setError('not-enrolled');
      } else if (err.response?.status === 400 || err.response?.status === 404) {
        setError('missing-meeting');
      } else if (err.response?.status === 503) {
        setError('sdk-config');
      } else {
        setError('network');
      }
      setState('error');
    }
  };

  const errorMessages: Record<ErrorReason, string> = {
    'too-early': `This session starts at ${new Date(session.startTime).toLocaleString()}. You can join 15 minutes before start time.`,
    'not-enrolled': 'You are not enrolled in this class. Please enroll first to join the live session.',
    'unauthenticated': 'Your session has expired. Please sign in again to join this class.',
    'cancelled': `This session has been ${session.status}. Unable to join.`,
    'missing-meeting': 'The instructor has not set up a meeting for this session yet.',
    'sdk-config': 'Zoom is not configured. Please contact support.',
    'signature-failed': 'Failed to generate meeting credentials. Please try again.',
    'init-failed': 'Failed to initialize Zoom. Please check your connection and try again.',
    'network': 'Network error. Please check your connection and try again.',
    'meeting-ended': 'This meeting has ended.',
  };

  return (
    <div className="space-y-4">
      {state === 'waiting' && error === 'too-early' && (
        <div className="bg-blue-50 border border-blue-200 rounded p-4 text-blue-800">
          <p className="font-semibold mb-2">Session Not Yet Available</p>
          <p className="text-sm mb-3">{errorMessages['too-early']}</p>
          {countdown && <p className="text-sm font-medium text-blue-600">{countdown}</p>}
        </div>
      )}

      {state === 'waiting' && !error && (
        <>
          <p className="text-gray-600 mb-4">Click below to join the live meeting.</p>
          <button
            onClick={handleJoinMeeting}
            className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
          >
            Join Class
          </button>
          {countdown && <p className="text-sm text-gray-500">{countdown}</p>}
        </>
      )}

      {state === 'loading' && (
        <div className="flex items-center gap-2">
          <div className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full" />
          <span>Connecting to meeting...</span>
        </div>
      )}

      {state === 'error' && error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800">
          <p className="font-semibold mb-2">Unable to Join</p>
          <p className="text-sm mb-3">{errorMessages[error]}</p>
          <button
            onClick={() => {
              setState('waiting');
              setError(null);
            }}
            className="text-sm underline hover:no-underline font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      {state === 'ready' && <div ref={containerRef} id="zmmtg-root" className="w-full h-96" />}

      <p className="text-sm text-gray-600 mt-4">
        Meeting controls (mute, video, chat) are available inside the meeting.
      </p>
    </div>
  );
}
