import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { ArrowLeft, Calendar, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBackendData } from '@/hooks/useBackendData';
import { classDetailUrl } from '@/lib/url';
import type { Class, ClassSchedule, Enrollment } from '@/types/api';
import Header from './Header';
import Footer from './Footer';
import BackendState from './BackendState';
import ZoomMeetingComponent from './ZoomMeetingComponent';

type Workspace = { class: Class; sessions: ClassSchedule[]; enrollment: Enrollment | null; canTeach: boolean };
type View = 'classroom' | 'materials' | 'assignments' | 'recording' | 'live' | 'waiting' | 'certificate';

const heroFallback = 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=1080';
const date = (value?: string) => value ? new Date(value).toLocaleString() : 'Not scheduled';
const safeUrl = (value?: string) => {
  try { const url = new URL(value || ''); return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined; } catch { return undefined; }
};

const statusBadge: Record<ClassSchedule['status'], string> = {
  live: 'bg-red-100 text-red-700',
  scheduled: 'bg-blue-100 text-blue-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-gray-100 text-gray-400',
};

const navTabs: [string, string][] = [
  ['classroom', 'Overview'],
  ['materials', 'Materials'],
  ['assignments', 'Assignments'],
  ['waiting-room', 'Next session'],
  ['certificate', 'Certificate'],
];

const activeRouteByView: Record<View, string> = {
  classroom: 'classroom', materials: 'materials', assignments: 'assignments',
  waiting: 'waiting-room', live: 'waiting-room', recording: 'waiting-room', certificate: 'certificate',
};

/** Compact, session-specific header shown above the embedded live-class meeting. */
function LiveClassHeader({ classId, courseTitle, instructorName, session }: {
  classId: string; courseTitle: string; instructorName: string; session?: ClassSchedule;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
      <div className="min-w-0">
        <Link
          to={classDetailUrl(classId, courseTitle)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to class
        </Link>
        <h2 className="text-lg font-bold text-gray-900 truncate">{session?.title || 'Live Classroom'}</h2>
        <p className="text-sm text-gray-500 truncate">{courseTitle} &middot; {instructorName}</p>
      </div>
      {session && (
        <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1.5 flex-shrink-0">
          {session.status === 'live' ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse motion-reduce:animate-none" /> LIVE NOW
            </span>
          ) : (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusBadge[session.status]}`}>{session.status}</span>
          )}
          <p className="text-sm text-gray-500 flex items-center gap-1.5 whitespace-nowrap">
            <Calendar className="h-3.5 w-3.5" /> {date(session.startTime)}
          </p>
        </div>
      )}
    </div>
  );
}

export default function BackendClassroom({ view }: { view: View }) {
  const { id } = useParams();
  const [params] = useSearchParams();
  const classId = id || params.get('classId');
  const { user, isLoading: authLoading } = useAuth();
  const [now, setNow] = useState(Date.now());
  const query = useBackendData<Workspace>(`/data/class/${classId || 'missing'}`);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const title = { classroom: 'Classroom', materials: 'Course Materials', assignments: 'Assignments', recording: 'Class Recording', live: 'Live Session', waiting: 'Waiting Room', certificate: 'Certificate' }[view];
  if (authLoading) return <BackendState title={title} loading message="Loading Nexnoon" />;
  if (!user) return <BackendState title={title} message="Sign in to access your classes." />;
  if (!classId) return <BackendState title={title} message="Select a class from My Classes to continue." />;
  if (query.isError) return <BackendState title={title} message="Unable to open this class. Check your connection and make sure you are enrolled or teaching it." retry={() => query.refetch()} />;
  if (!query.data) return <BackendState title={title} loading message="Loading Nexnoon" />;
  const { class: cls, sessions, enrollment, canTeach } = query.data;
  const requested = params.get('sessionId');
  const session = requested ? sessions.find(s => s.id === requested) : view === 'recording'
    ? sessions.find(s => s.recordingUrl)
    : sessions.find(s => s.status === 'live') || sessions.find(s => s.status !== 'cancelled' && new Date(s.endTime).getTime() > now);
  const recordingUrl = safeUrl(session?.recordingUrl);
  const certificateUrl = enrollment?.status === 'completed' ? safeUrl(enrollment.certificateUrl) : undefined;
  const activeRoute = activeRouteByView[view];

  return <div className="min-h-screen flex flex-col bg-gray-50"><Header />

    {/* Hero */}
    <div
      className="relative pt-16 pb-10 overflow-hidden"
      style={{ backgroundImage: `url(${cls.thumbnail || heroFallback})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/60 to-black/50" />
      <div className="relative z-10 w-[90vw] max-w-6xl mx-auto">
        <Link to="/my-classes" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to My Classes
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="inline-block px-3 py-1 bg-[#889dd1]/30 backdrop-blur-sm border border-white/20 text-white text-xs rounded-full mb-3">
              {cls.category}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{cls.title}</h1>
            <p className="text-white/80 text-sm">{cls.instructor.name} &middot; {cls.totalSessions} sessions</p>
          </div>
          {enrollment && (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-5 py-3">
              <p className="text-xs text-white/70 mb-1">Your progress</p>
              <p className="text-lg font-bold text-white">{enrollment.progress}% <span className="text-white/60 font-normal capitalize">&middot; {enrollment.status}</span></p>
            </div>
          )}
        </div>
      </div>
    </div>

    <main className="flex-1 w-[90vw] max-w-6xl mx-auto pb-10">
      {/* Nav */}
      <nav className="flex flex-wrap gap-1.5 bg-white rounded-2xl shadow-lg border border-gray-100 p-2 -mt-6 relative z-10 mb-6">
        {navTabs.map(([route, label]) => (
          <Link
            key={route}
            to={`/${route}/${classId}`}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeRoute === route ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {label}
          </Link>
        ))}
        {canTeach && (
          <Link to={`/edit-class/${classId}`} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
            Edit class
          </Link>
        )}
      </nav>

      <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8">
        {view === 'classroom' && <>
          <p className="whitespace-pre-line text-gray-600 mb-6">{cls.description}</p>

          {/* Virtual meeting room */}
          <div className="mb-8">
            <LiveClassHeader classId={classId!} courseTitle={cls.title} instructorName={cls.instructor.name} session={session} />
            {session?.zoomMeetingId ? (
              <ZoomMeetingComponent
                classId={classId!}
                session={session}
                userName={user?.name || 'Student'}
                instructorName={cls.instructor.name}
                isEnrolled={!canTeach && enrollment?.status === 'active'}
              />
            ) : (
              <div className="rounded-2xl border border-gray-800 bg-gradient-to-b from-gray-900 to-black p-10 text-center">
                <p className="text-white/60 text-sm">
                  {session ? 'The instructor has not provided a meeting link for this session yet.' : 'No upcoming session has been scheduled.'}
                </p>
              </div>
            )}
          </div>

          {/* All sessions */}
          <h2 className="text-lg font-bold text-gray-900 mb-3">All Sessions</h2>
          {!sessions.length && <p className="text-gray-500">No sessions have been scheduled yet.</p>}
          <div className="space-y-3">
            {sessions.map(s => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-4 border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{s.title}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusBadge[s.status]}`}>{s.status}</span>
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> {date(s.startTime)}
                  </p>
                </div>
                <div className="flex gap-4 flex-shrink-0 text-sm">
                  {s.status !== 'cancelled' && <Link className="text-[#889dd1] font-medium hover:underline" to={`/live-session/${classId}?sessionId=${s.id}`}>Session details</Link>}
                  {safeUrl(s.recordingUrl) && <Link className="text-gray-600 font-medium hover:underline" to={`/recorded-class/${classId}?sessionId=${s.id}`}>Watch recording</Link>}
                </div>
              </div>
            ))}
          </div>
        </>}
        {view === 'materials' && <>{!cls.materials?.length && <p>No materials have been added by the instructor.</p>}{cls.materials?.map((item,index)=><div className="border-b py-4" key={index}>{safeUrl(item) ? <a href={safeUrl(item)} target="_blank" rel="noopener noreferrer" className="underline">{item}</a> : <p>{item}</p>}</div>)}</>}
        {view === 'assignments' && <>{!cls.assignments?.length && <p>No assignments have been added by the instructor.</p>}{cls.assignments?.map((a,index)=><article className="border rounded p-4 mb-4" key={index}><h3 className="font-bold">{a.title}</h3><p>{a.description}</p><p>Due: {date(a.dueDate)}</p></article>)}</>}
        {view === 'recording' && <>{recordingUrl ? <><h3 className="font-bold mb-4">{session?.title}</h3><video className="w-full rounded-lg bg-black" controls src={recordingUrl} /><a className="underline block mt-4" href={recordingUrl} target="_blank" rel="noopener noreferrer">Open recording</a></> : <p>No recording is available for this session yet.</p>}</>}
        {(view === 'live' || view === 'waiting') && <>{session ? (
          <>
            <LiveClassHeader classId={classId!} courseTitle={cls.title} instructorName={cls.instructor.name} session={session} />
            {session.zoomMeetingId ? (
              <ZoomMeetingComponent
                classId={classId!}
                session={session}
                userName={user?.name || 'Student'}
                instructorName={cls.instructor.name}
                isEnrolled={!canTeach && enrollment?.status === 'active'}
              />
            ) : <p>The instructor has not provided a meeting link yet.</p>}
          </>
        ) : <p>No upcoming session has been scheduled.</p>}</>}
        {view === 'certificate' && <>{certificateUrl ? <a className="underline flex items-center gap-2" href={certificateUrl} target="_blank" rel="noopener noreferrer"><CheckCircle2 className="h-4 w-4" />Open your certificate</a> : <p>No certificate has been issued for this enrollment yet.</p>}</>}
      </section>
    </main><Footer /></div>;
}
