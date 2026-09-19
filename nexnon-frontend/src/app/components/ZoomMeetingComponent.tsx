import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { AlertCircle, CheckCircle2, Clock, Maximize2, Minimize2, Video } from 'lucide-react';
import { apiClient } from '@/lib/api';
import type { ClassSchedule } from '@/types/api';
import type ZoomMtgEmbeddedDefault from '@zoom/meetingsdk/embedded';

interface ZoomMeetingComponentProps {
  classId: string;
  session: ClassSchedule;
  userName: string;
  /** Shown in the pre-join card when available. Purely presentational. */
  instructorName?: string;
  /** Shows an enrollment confirmation line in the pre-join card when true. */
  isEnrolled?: boolean;
  /** Class thumbnail shown behind the pre-join/waiting card. Purely presentational. */
  thumbnail?: string;
}

type EmbeddedZoomClient = ReturnType<typeof ZoomMtgEmbeddedDefault.createClient>;

type JoinState = 'waiting' | 'loading' | 'ready' | 'error';
type ErrorReason = 'too-early' | 'not-enrolled' | 'unauthenticated' | 'cancelled' | 'missing-meeting' | 'sdk-config' | 'init-failed' | 'network' | 'meeting-ended' | 'meeting-locked';

export default function ZoomMeetingComponent({ classId, session, userName, instructorName, isEnrolled, thumbnail }: ZoomMeetingComponentProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<EmbeddedZoomClient | null>(null);
  const clientInitializedRef = useRef(false);
  const [state, setState] = useState<JoinState>('waiting');
  const [error, setError] = useState<ErrorReason | null>(null);
  const [countdown, setCountdown] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  // Leave the meeting and free the SDK's media resources if the student navigates
  // away (e.g. back to My Classes) while still connected.
  useEffect(() => {
    return () => {
      if (clientRef.current && clientInitializedRef.current) {
        clientRef.current.leaveMeeting().catch(() => {});
      }
    };
  }, []);

  // Component View sizes its video canvas to the pixel dimensions given at init.
  // Keep it filling the wrapper (instead of Zoom's small default floating widget)
  // by re-measuring whenever the wrapper resizes - including entering/exiting fullscreen.
  useEffect(() => {
    if (state !== 'ready' || !wrapperRef.current) return;
    const wrapper = wrapperRef.current;
    const resize = () => {
      const rect = wrapper.getBoundingClientRect();
      clientRef.current?.updateVideoOptions({
        viewSizes: { default: { width: Math.round(rect.width), height: Math.round(rect.height) } },
      });
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [state]);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(document.fullscreenElement === wrapperRef.current);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const handleToggleFullscreen = () => {
    if (!wrapperRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      wrapperRef.current.requestFullscreen().catch(() => {});
    }
  };

  const handleJoinMeeting = async () => {
    setState('loading');
    setError(null);

    try {
      // Request credentials from backend (apiClient attaches the auth token and
      // retries once with a refreshed token on 401, same as every other API call).
      const response = await apiClient.post(
        `/classes/${classId}/sessions/${session.id}/join-credentials`,
        {}
      );

      if (!response.data.success) {
        const message = response.data.message || 'Unable to join meeting';
        if (message.includes('not started')) {
          setError('too-early');
        } else if (message.includes('not enrolled')) {
          setError('not-enrolled');
        } else if (message.includes('cancelled') || message.includes('completed') || message.includes('already ended') || message.includes('join window')) {
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

      if (!containerRef.current || !wrapperRef.current) {
        setError('init-failed');
        setState('error');
        return;
      }

      try {
        // Load the Zoom Meeting SDK's Component View on demand so it never bloats
        // routes that don't join a meeting. Component View renders inside the
        // container we give it, instead of Client View's full-page takeover.
        const { default: ZoomMtgEmbedded } = await import('@zoom/meetingsdk/embedded');

        if (!clientRef.current) {
          clientRef.current = ZoomMtgEmbedded.createClient();
        }
        const client = clientRef.current;

        if (!clientInitializedRef.current) {
          // Without an explicit size, Component View renders as a small draggable
          // floating widget instead of filling the space we give it - size it to
          // the wrapper up front (the ResizeObserver effect keeps it in sync after).
          const rect = wrapperRef.current.getBoundingClientRect();
          await client.init({
            zoomAppRoot: containerRef.current,
            language: 'en-US',
            patchJsMedia: true,
            customize: {
              video: {
                isResizable: false,
                popper: { disableDraggable: true },
                viewSizes: { default: { width: Math.round(rect.width), height: Math.round(rect.height) } },
              },
            },
          });
          // Detect the host ending the meeting (or the connection closing) while
          // already joined, so the UI can leave the embedded view instead of
          // freezing on Zoom's own internal state.
          client.on('connection-change', (payload: { state?: string }) => {
            if (payload?.state === 'Closed') {
              setError('meeting-ended');
              setState('error');
            }
          });
          clientInitializedRef.current = true;
        }

        await client.join({
          signature,
          meetingNumber,
          password: passWord,
          userName: displayName || userName,
          userEmail: userEmail || '',
        });

        setState('ready');
      } catch (sdkError: any) {
        console.error('Zoom SDK error:', sdkError?.type, sdkError?.reason, sdkError);
        const reason = typeof sdkError?.reason === 'string' ? sdkError.reason.toLowerCase() : '';
        if (reason.includes('ended')) {
          setError('meeting-ended');
        } else if (reason.includes('not started')) {
          setError('too-early');
        } else if (reason.includes('locked')) {
          setError('meeting-locked');
        } else {
          setError('init-failed');
        }
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
        } else if (message.includes('cancelled') || message.includes('completed') || message.includes('already ended') || message.includes('join window')) {
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
    'init-failed': 'Failed to initialize Zoom. Please check your connection and try again.',
    'network': 'Network error. Please check your connection and try again.',
    'meeting-ended': 'This meeting has ended.',
    'meeting-locked': 'The host has locked this meeting. Please contact your instructor.',
  };

  return (
    <div className="space-y-3">
      {/* A single self-contained "meeting room" card - dark themed like a real video
          call lobby. The zoomAppRoot container is always mounted at real, non-zero
          dimensions (a hidden/zero-size container makes Zoom's SDK fail with an opaque
          init error); everything else here is an overlay on top of it until join()
          succeeds, at which point the overlay is removed and the real video shows through. */}
      <div
        ref={wrapperRef}
        role="region"
        aria-label="Live classroom"
        className={`relative w-full rounded-2xl overflow-hidden border border-gray-800 bg-gradient-to-b from-gray-900 to-black ${isFullscreen ? 'h-screen' : ''}`}
        style={isFullscreen ? undefined : { minHeight: 480 }}
      >
        <div ref={containerRef} className="absolute inset-0" />

        {state === 'waiting' && error === 'too-early' && (
          // Opaque background: the SDK can leave a partial "waiting" panel of its own
          // mounted in the zoomAppRoot container beneath this; without an opaque fill
          // here, that stray SDK content shows through around our centered message.
          // Title/instructor/date are intentionally omitted here - the LiveClassHeader
          // right above this card already shows them; this card only adds what's new.
          <div className="absolute inset-0 z-10 overflow-hidden">
            {thumbnail && (
              <img src={thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
            )}
            <div className="absolute inset-0 bg-gray-900/85" />
            <div className="relative h-full flex flex-col items-center justify-center text-center px-6 overflow-y-auto py-8">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center mb-4 flex-shrink-0">
                <Clock className="h-7 w-7 text-blue-300" />
              </div>
              {countdown && <p className="text-3xl font-mono font-bold text-white mb-2" role="status" aria-live="polite">{countdown}</p>}
              <p className="text-white/60 text-sm max-w-sm">You can join 15 minutes before this session starts.</p>
            </div>
          </div>
        )}

        {state === 'waiting' && !error && (
          // Title/instructor/date/status are intentionally omitted here - the
          // LiveClassHeader right above this card already shows them.
          <div className="absolute inset-0 z-10 bg-gray-900 flex flex-col items-center justify-center text-center px-6 overflow-y-auto py-8">
            <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-4 flex-shrink-0">
              <Video className="h-7 w-7 text-white" />
            </div>
            {isEnrolled && (
              <p className="flex items-center gap-1.5 text-xs text-emerald-400 mb-4">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> You&apos;re enrolled and ready to join
              </p>
            )}
            <button
              onClick={handleJoinMeeting}
              className="inline-flex items-center gap-2 bg-[#889dd1] hover:bg-[#7086c4] text-white px-8 py-3 rounded-full font-semibold shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            >
              <Video className="h-4 w-4" aria-hidden="true" /> Join Class
            </button>
            {countdown && <p className="text-white/40 text-xs mt-3" aria-hidden="true">{countdown}</p>}
            <div className="mt-5 max-w-xs space-y-1">
              <p className="text-white/35 text-xs">Your browser may ask for camera and microphone access when you join.</p>
              <p className="text-white/35 text-xs">Only enrolled students can join, and only during the scheduled session window.</p>
            </div>
          </div>
        )}

        {state === 'loading' && (
          <div className="absolute inset-0 z-10 bg-gray-900 flex flex-col items-center justify-center gap-3" role="status" aria-live="polite">
            <div className="animate-spin motion-reduce:animate-none h-8 w-8 border-2 border-white/30 border-t-white rounded-full" aria-hidden="true" />
            <span className="text-white/70 text-sm">Securely preparing your classroom&hellip;</span>
          </div>
        )}

        {state === 'error' && error === 'meeting-ended' && (
          <div className="absolute inset-0 z-10 bg-gray-900 flex flex-col items-center justify-center text-center px-6" role="status" aria-live="polite">
            <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-4">
              <Video className="h-7 w-7 text-white/70" aria-hidden="true" />
            </div>
            <p className="text-white font-bold text-lg mb-1">Class Ended</p>
            <p className="text-white/60 text-sm max-w-sm mb-5">{errorMessages['meeting-ended']}</p>
            <Link
              to={`/classroom/${classId}`}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-2.5 rounded-full font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            >
              Return to Class
            </Link>
          </div>
        )}

        {state === 'error' && error && error !== 'meeting-ended' && (
          <div className="absolute inset-0 z-10 bg-gray-900 flex flex-col items-center justify-center text-center px-6" role="alert" aria-live="polite">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-400/30 flex items-center justify-center mb-4">
              <AlertCircle className="h-7 w-7 text-red-300" aria-hidden="true" />
            </div>
            <p className="text-white font-bold text-lg mb-1">Unable to Join</p>
            <p className="text-white/60 text-sm max-w-sm mb-4">{errorMessages[error]}</p>
            <button
              onClick={() => {
                setState('waiting');
                setError(null);
              }}
              className="text-sm font-medium text-white/80 underline hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 rounded"
            >
              Try Again
            </button>
          </div>
        )}

        {state === 'ready' && (
          <button
            onClick={handleToggleFullscreen}
            className="absolute top-3 right-3 z-10 p-2 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            title={isFullscreen ? 'Exit fullscreen' : 'Expand to fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        )}
      </div>

      {state === 'ready' && (
        <p className="text-xs text-gray-500 text-center">
          Meeting controls (mute, video, chat, leave) are available inside the meeting above.
        </p>
      )}
    </div>
  );
}
