import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import Header from './Header';
import Footer from './Footer';
import BackendState from './BackendState';
import { useAuth } from '@/contexts/AuthContext';
import { useBackendData } from '@/hooks/useBackendData';
import { classDetailUrl } from '@/lib/url';
import type { Class, ClassSchedule } from '@/types/api';

type Student = { id: string; userId: string; name: string; email: string; classTitle: string; classId: string; status: string; progress: number; enrolledAt: string };
type Payment = { id: string; classId: string; classTitle?: string; student?: string; amount: number; currency: string; status: string; createdAt: string };
type Account = { id: string; fullName: string; email: string; role: string; createdAt: string };
type Data = { classes: Class[]; students?: Student[]; payments: Payment[]; sessions?: ClassSchedule[]; users?: Account[] };
const money = (amount: number, currency: string) => new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);

export default function BackendDashboard({ view }: { view: 'overview' | 'earnings' | 'analytics' | 'students' | 'admin' }) {
  const { user, isLoading: authLoading } = useAuth();
  const [params] = useSearchParams();
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('all');
  const admin = view === 'admin';
  const title = { overview: 'Nexnoon Expert Dashboard', earnings: 'Earnings', analytics: 'Analytics', students: 'Students', admin: 'Admin Dashboard' }[view];
  const query = useBackendData<Data>(admin ? '/data/admin' : '/data/instructor');
  if (authLoading) return <BackendState title={title} loading message="Loading Nexnoon" />;
  if (!user) return <BackendState title={title} message="Sign in to view your data." />;
  if (admin ? user.role !== 'admin' : !['instructor', 'admin'].includes(user.role)) return <BackendState title={title} message="This page is available to authorized instructors and administrators." />;
  if (query.isError) return <BackendState title={title} message="Unable to load your data. Check the backend connection and try again." retry={() => query.refetch()} />;
  if (!query.data) return <BackendState title={title} loading message="Loading Nexnoon" />;
  const data = query.data;
  const days = period === 'week' ? 7 : period === 'month' ? 30 : period === 'year' ? 365 : Infinity;
  const after = Date.now() - days * 86400000;
  const payments = data.payments.filter(p => new Date(p.createdAt).getTime() >= after);
  const totals = payments.filter(p => p.status === 'completed').reduce<Record<string, number>>((acc, p) => {
    acc[p.currency] = (acc[p.currency] || 0) + p.amount; return acc;
  }, {});
  const totalLabel = Object.entries(totals).map(([currency, amount]) => money(amount, currency)).join(' · ') || 'No payments';
  const students = (data.students || []).filter(s => (!params.get('classId') || s.classId === params.get('classId')) && `${s.name} ${s.email} ${s.classTitle}`.toLowerCase().includes(search.toLowerCase()));
  const classes = data.classes.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));
  const metrics = admin
    ? [['Users', data.users?.length || 0], ['Classes', data.classes.length], ['Published classes', data.classes.filter(c => c.status === 'published').length], ['Collected payments', totalLabel]]
    : [['Classes', data.classes.length], ['Students', new Set((data.students || []).map(s => s.userId)).size], ['Sessions', data.sessions?.length || 0], ['Collected payments', totalLabel]];
  return <div className="min-h-screen flex flex-col bg-gray-50"><Header />
    <main className="flex-1 w-[90vw] max-w-7xl mx-auto py-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8"><div><h1 className="text-3xl font-bold">{title}</h1><p className="text-gray-600 mt-2">Your classes and activity</p></div>
        <Link to="/create-class" className="bg-black text-white px-5 py-3 rounded-lg">Create Class</Link></div>
      <nav className="flex flex-wrap gap-5 mb-8">{[['/instructor/dashboard', 'Overview'], ['/earnings', 'Earnings'], ['/analytics', 'Analytics'], ['/students-management', 'Students'], ['/my-classes', 'My Classes']].map(([url,label]) => <Link className="underline" key={url} to={url}>{label}</Link>)}</nav>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">{metrics.map(([label,value]) => <div key={label} className="bg-white border rounded-xl p-6"><p className="text-gray-600 mb-3">{label}</p><strong className="text-2xl">{value}</strong></div>)}</div>
      <div className="flex flex-wrap gap-4 mb-6"><input aria-label="Search your records" placeholder="Search classes or students" className="border rounded-lg p-3 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
        <select aria-label="Payment period" className="border rounded-lg p-3 bg-white" value={period} onChange={e => setPeriod(e.target.value)}><option value="all">All payments</option><option value="week">Last 7 days</option><option value="month">Last 30 days</option><option value="year">Last 365 days</option></select>
        <button onClick={() => query.refetch()} className="border rounded-lg px-4">Refresh</button></div>
      {view !== 'students' && <section className="bg-white border rounded-xl p-6 mb-8"><h2 className="text-xl font-bold mb-4">Classes</h2>
        {!classes.length && <p className="text-gray-600">No classes found. Create your first class to get started.</p>}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{classes.map(c => <article className="border rounded-lg p-4" key={c.id}>
          {c.thumbnail && <img src={c.thumbnail} alt="" className="w-full h-32 object-cover rounded mb-3" />}
          <Link to={classDetailUrl(c.id, c.title)} className="font-bold hover:underline">{c.title}</Link><p className="text-gray-600 my-2">{c.category} · {c.status}</p><p>{c.enrolledStudents} enrolled · {money(c.price,c.currency)}</p>
          <div className="flex gap-4 mt-4"><Link className="underline" to={`/edit-class/${c.id}`}>Edit</Link><Link className="underline" to={`/students-management?classId=${c.id}`}>Students</Link></div>
        </article>)}</div></section>}
      {!admin && view !== 'earnings' && <section className="bg-white border rounded-xl p-6 mb-8"><h2 className="text-xl font-bold mb-4">Enrollments</h2>
        {!students.length ? <p className="text-gray-600">No enrollments found.</p> : <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr>{['Student','Email','Class','Status','Progress'].map(h=><th className="p-3 border-b" key={h}>{h}</th>)}</tr></thead><tbody>{students.map(s=><tr key={s.id}><td className="p-3">{s.name}</td><td className="p-3">{s.email}</td><td className="p-3">{s.classTitle}</td><td className="p-3">{s.status}</td><td className="p-3">{s.progress}%</td></tr>)}</tbody></table></div>}</section>}
      {view !== 'students' && <section className="bg-white border rounded-xl p-6 mb-8"><h2 className="text-xl font-bold mb-4">Payments</h2>
        {!payments.length ? <p className="text-gray-600">No payments recorded for this period.</p> : <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr>{['Date','Class','Amount','Status'].map(h=><th className="p-3 border-b" key={h}>{h}</th>)}</tr></thead><tbody>{payments.map(p=><tr key={p.id}><td className="p-3">{new Date(p.createdAt).toLocaleDateString()}</td><td className="p-3">{p.classTitle || data.classes.find(c=>c.id===p.classId)?.title || 'Deleted class'}</td><td className="p-3">{money(p.amount,p.currency)}</td><td className="p-3">{p.status}</td></tr>)}</tbody></table></div>}</section>}
      {admin && <section className="bg-white border rounded-xl p-6"><h2 className="text-xl font-bold mb-4">Users</h2>{!data.users?.length && <p>No users found.</p>}{data.users?.map(u=><div className="py-3 border-b" key={u.id}><strong>{u.fullName}</strong><p>{u.email} · {u.role}</p></div>)}</section>}
    </main><Footer /></div>;
}
