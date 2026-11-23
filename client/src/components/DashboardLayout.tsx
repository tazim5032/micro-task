import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { homeFor, useAuth } from '../lib/auth';
import type { Notification, Role } from '../lib/types';
import { Logo } from './Layout';
import { Coins, Spinner } from './ui';

const icons: Record<string, string> = {
  overview: 'M4 13h6V4H4zM14 20h6v-9h-6zM4 20h6v-3H4zM14 7h6V4h-6z',
  tasks: 'M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2',
  add: 'M12 5v14M5 12h14',
  coins: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9 9.5a3 3 0 0 1 3-2c1.7 0 3 .9 3 2.2 0 2.8-6 1.5-6 4.4 0 1.3 1.3 2.4 3 2.4a3 3 0 0 0 3-2M12 5.5v1.5M12 17v1.5',
  history: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2',
  wallet: 'M4 7h15a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a2 2 0 0 1 2-2h11M16 13h.01',
  users: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M17 3a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6.3',
  submissions: 'M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M9 15l2 2 4-4',
};

const links: Record<Role, { to: string; label: string; icon: string; end?: boolean }[]> = {
  worker: [
    { to: '/dashboard/worker', label: 'Overview', icon: 'overview', end: true },
    { to: '/tasks', label: 'Find tasks', icon: 'tasks' },
    { to: '/dashboard/worker/submissions', label: 'My submissions', icon: 'submissions' },
    { to: '/dashboard/worker/withdrawals', label: 'Withdraw', icon: 'wallet' },
  ],
  creator: [
    { to: '/dashboard/creator', label: 'Overview & reviews', icon: 'overview', end: true },
    { to: '/dashboard/creator/new', label: 'Post a task', icon: 'add' },
    { to: '/dashboard/creator/tasks', label: 'My tasks', icon: 'tasks' },
    { to: '/dashboard/creator/coins', label: 'Buy coins', icon: 'coins' },
    { to: '/dashboard/creator/payments', label: 'Payment history', icon: 'history' },
  ],
  admin: [
    { to: '/dashboard/admin', label: 'Overview', icon: 'overview', end: true },
    { to: '/dashboard/admin/withdrawals', label: 'Withdrawals', icon: 'wallet' },
    { to: '/dashboard/admin/users', label: 'Users', icon: 'users' },
    { to: '/dashboard/admin/tasks', label: 'Tasks', icon: 'tasks' },
  ],
};

export function RequireAuth({ role, children }: { role?: Role; children: JSX.Element }) {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <Spinner />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (role && user.role !== role) return <Navigate to={homeFor(user.role)} replace />;
  return children;
}

function Bell() {
  const [data, setData] = useState<{ notifications: Notification[]; unread: number } | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const load = useCallback(() => { api<{ notifications: Notification[]; unread: number }>('/notifications').then(setData).catch(() => {}); }, []);
  useEffect(() => { load(); }, [load, pathname]);
  useEffect(() => {
    const t = setInterval(load, 20000);
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => { clearInterval(t); document.removeEventListener('mousedown', close); };
  }, [load]);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next && data?.unread) { await api('/notifications/read', { method: 'POST' }).catch(() => {}); setData(d => d && { ...d, unread: 0 }); }
  }

  return (
    <div className="relative" ref={ref}>
      <button className="btn-ghost relative px-2.5" onClick={toggle} aria-label={`Notifications${data?.unread ? `, ${data.unread} unread` : ''}`} aria-expanded={open}>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0" /></svg>
        {!!data?.unread && <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-zinc-900 px-1 text-[10px] font-semibold text-white">{data.unread}</span>}
      </button>
      {open && (
        <div className="card absolute right-0 z-40 mt-2 w-[min(90vw,360px)] overflow-hidden">
          <p className="border-b border-zinc-100 px-4 py-3 text-sm font-semibold">Notifications</p>
          <ul className="max-h-96 divide-y divide-zinc-100 overflow-y-auto">
            {!data?.notifications.length && <li className="px-4 py-6 text-center text-sm text-zinc-500">You're all caught up.</li>}
            {data?.notifications.map(n => (
              <li key={n.id}>
                <button className={`w-full px-4 py-3 text-left text-sm hover:bg-zinc-50 ${n.read ? 'text-zinc-500' : 'text-zinc-900'}`} onClick={() => { setOpen(false); if (n.link) navigate(n.link); }}>
                  {!n.read && <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-zinc-900 align-middle" />}{n.message}
                  <span className="mt-1 block text-xs text-zinc-400">{new Date(n.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function DashboardLayout({ role }: { role: Role }) {
  const { user, logout, refresh } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); window.scrollTo(0, 0); refresh(); }, [pathname, refresh]);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5"><Logo /></div>
      <p className="eyebrow px-5 pb-2 pt-4">{role === 'creator' ? 'Task creator' : role === 'worker' ? 'Worker' : 'Admin'}</p>
      <nav className="flex flex-col gap-0.5 px-3" aria-label="Dashboard">
        {links[role].map(l => (
          <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'}`}>
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={icons[l.icon]} /></svg>{l.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto border-t border-zinc-200 p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-700">{user?.name.charAt(0)}</span>
          <div className="min-w-0"><p className="truncate text-sm font-medium">{user?.name}</p><p className="truncate text-xs text-zinc-500">{user?.email}</p></div>
        </div>
        <div className="mt-3 flex gap-2">
          <Link to="/" className="btn-outline flex-1 px-3 py-2 text-xs">Home</Link>
          <button className="btn-ghost flex-1 px-3 py-2 text-xs" onClick={() => { logout(); navigate('/'); }}>Log out</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-zinc-200 bg-white lg:block">{sidebar}</aside>
      {open && <div className="fixed inset-0 z-30 bg-zinc-900/30 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-zinc-200 bg-white transition-transform lg:hidden ${open ? 'translate-x-0' : '-translate-x-full'}`}>{sidebar}</aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-zinc-200 bg-white/85 px-4 backdrop-blur sm:px-6 lg:px-10">
          <button className="btn-ghost px-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          </button>
          <span className="text-sm text-zinc-500">Dashboard</span>
          <div className="ml-auto flex items-center gap-2">
            {role !== 'admin' && user && <span className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm font-semibold" title="Coin balance"><Coins value={user.coins} /></span>}
            <Bell />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10"><Outlet /></main>
      </div>
    </div>
  );
}
