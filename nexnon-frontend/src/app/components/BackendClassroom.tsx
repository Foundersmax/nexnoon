import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { useBackendData } from '@/hooks/useBackendData';
import type { Class, ClassSchedule, Enrollment } from '@/types/api';
import Header from './Header';
import Footer from './Footer';
import BackendState from './BackendState';
import ZoomMeetingComponent from './ZoomMeetingComponent';

type Workspace = { class: Class; sessions: ClassSchedule[]; enrollment: Enrollment | null; canTeach: boolean };
const date = (value?: string) => value ? new Date(value).toLocaleString() : 'Not scheduled';
const safeUrl = (value?: string) => {
  try { const url = new URL(value || ''); return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined; } catch { return undefined; }
};

export default function BackendClassroom({ view }: { view: 'classroom' | 'materials' | 'assignments' | 'recording' | 'live' | 'waiting' | 'certificate' }) {
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
  const seconds = session ? Math.max(0, Math.ceil((new Date(session.startTime).getTime() - now) / 1000)) : 0;
  const recordingUrl = safeUrl(session?.recordingUrl);
  const certificateUrl = enrollment?.status === 'completed' ? safeUrl(enrollment.certificateUrl) : undefined;
  return <div className="min-h-screen flex flex-col bg-gray-50"><Header />
    <main className="flex-1 w-[90vw] max-w-6xl mx-auto py-10">
      <Link to="/my-classes" className="underline">Back to My Classes</Link>
      <div className="bg-white border rounded-xl p-6 mt-6 mb-6"><h1 className="text-3xl font-bold mb-3">{cls.title}</h1><p className="text-gray-600">{cls.instructor.name} · {cls.totalSessions} sessions</p>
        {enrollment && <p className="mt-3">Progress: {enrollment.progress}% · {enrollment.status}</p>}
      </div>
      <nav className="flex flex-wrap gap-5 mb-6">{[['classroom','Overview'],['materials','Materials'],['assignments','Assignments'],['waiting-room','Next session'],['certificate','Certificate']].map(([route,label])=><Link className="underline" key={route} to={`/${route}/${classId}`}>{label}</Link>)}{canTeach && <Link className="underline" to={`/edit-class/${classId}`}>Edit class</Link>}</nav>
      <section className="bg-white border rounded-xl p-6"><h2 className="text-2xl font-bold mb-5">{title}</h2>
        {view === 'classroom' && <><p className="whitespace-pre-line text-gray-700 mb-6">{cls.description}</p>
          {!sessions.length && <p>No sessions have been scheduled yet.</p>}
          {sessions.map(s => <article key={s.id} className="border rounded-lg p-4 mb-4"><h3 className="font-bold">{s.title}</h3><p className="text-gray-600 my-2">{date(s.startTime)} · {s.status}</p><p>{s.description}</p>
            <div className="flex gap-5 mt-3">{s.status !== 'cancelled' && <Link className="underline" to={`/live-session/${classId}?sessionId=${s.id}`}>Session details</Link>}{safeUrl(s.recordingUrl) && <Link className="underline" to={`/recorded-class/${classId}?sessionId=${s.id}`}>Watch recording</Link>}</div>
          </article>)}</>}
        {view === 'materials' && <>{!cls.materials?.length && <p>No materials have been added by the instructor.</p>}{cls.materials?.map((item,index)=><div className="border-b py-4" key={index}>{safeUrl(item) ? <a href={safeUrl(item)} target="_blank" rel="noopener noreferrer" className="underline">{item}</a> : <p>{item}</p>}</div>)}</>}
        {view === 'assignments' && <>{!cls.assignments?.length && <p>No assignments have been added by the instructor.</p>}{cls.assignments?.map((a,index)=><article className="border rounded p-4 mb-4" key={index}><h3 className="font-bold">{a.title}</h3><p>{a.description}</p><p>Due: {date(a.dueDate)}</p></article>)}</>}
        {view === 'recording' && <>{recordingUrl ? <><h3 className="font-bold mb-4">{session?.title}</h3><video className="w-full rounded-lg bg-black" controls src={recordingUrl} /><a className="underline block mt-4" href={recordingUrl} target="_blank" rel="noopener noreferrer">Open recording</a></> : <p>No recording is available for this session yet.</p>}</>}
        {(view === 'live' || view === 'waiting') && <>{session ? <><h3 className="font-bold mb-3">{session.title}</h3><p>{date(session.startTime)}</p><p className="my-3">{seconds > 0 ? `Starts in ${Math.floor(seconds / 3600)}h ${Math.floor(seconds % 3600 / 60)}m ${seconds % 60}s` : `Session status: ${session.status}`}</p>
          {session.zoomMeetingId ? <ZoomMeetingComponent classId={classId!} session={session} userName={user?.name || 'Student'} /> : <p>The instructor has not provided a meeting link yet.</p>}</> : <p>No upcoming session has been scheduled.</p>}</>}
        {view === 'certificate' && <>{certificateUrl ? <a className="underline" href={certificateUrl} target="_blank" rel="noopener noreferrer">Open your certificate</a> : <p>No certificate has been issued for this enrollment yet.</p>}</>}
      </section>
    </main><Footer /></div>;
}
