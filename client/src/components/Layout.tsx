import { useEffect, useState } from 'react';
import { IS_DEMO, resetDemoData } from '../lib/api';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { homeFor, useAuth } from '../lib/auth';
import { Coins } from './ui';

export function Logo({ light }: { light?: boolean }) {
  return (
    <Link to="/" className={`flex items-center gap-2.5 font-semibold tracking-tight ${light ? 'text-white' : 'text-zinc-900'}`}>
      <span className={`grid h-8 w-8 place-items-center rounded-lg ${light ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-white'}`}>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l4 4 10-10" /></svg>
      </span>
      Micro Task
    </Link>
  );
}

const nav = [{ to: '/', label: 'Home', end: true }, { to: '/tasks', label: 'Find tasks' }, { to: '/how-it-works', label: 'How it works' }];

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [pathname]);
  const linkCls = ({ isActive }: { isActive: boolean }) => `rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`;
  const right = user ? (
    <>
      {user.role !== 'admin' && <span className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium" title="Your coin balance"><Coins value={user.coins} /></span>}
      <Link to={homeFor(user.role)} className="btn-outline py-2">Dashboard</Link>
      <button className="btn-ghost py-2" onClick={() => { logout(); navigate('/'); }}>Log out</button>
    </>
  ) : (
    <>
      <Link to="/login" className="btn-ghost py-2">Log in</Link>
      <Link to="/register" className="btn-primary py-2">Join free</Link>
    </>
  );
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/85 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">{nav.map(n => <NavLink key={n.to} to={n.to} end={n.end} className={linkCls}>{n.label}</NavLink>)}</nav>
        <div className="hidden items-center gap-2 md:flex">{right}</div>
        <button className="btn-ghost px-2 md:hidden" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-label="Menu">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2"><path d={open ? 'M6 6l12 12M18 6L6 18' : 'M4 7h16M4 12h16M4 17h16'} /></svg>
        </button>
      </div>
      {open && (
        <div className="border-t border-zinc-200 bg-white md:hidden">
          <div className="container-x flex flex-col gap-1 py-3">
            {nav.map(n => <NavLink key={n.to} to={n.to} end={n.end} className={linkCls}>{n.label}</NavLink>)}
            <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-3">{right}</div>
          </div>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-24 bg-zinc-900 text-zinc-400">
      <div className="container-x grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo light />
          <p className="mt-4 max-w-sm text-sm leading-relaxed">Small online tasks, fair pay. Creators get work done fast; workers earn coins and withdraw to mobile wallets.</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Platform</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/tasks" className="hover:text-white">Find tasks</Link></li>
            <li><Link to="/register" className="hover:text-white">Post a task</Link></li>
            <li><Link to="/how-it-works" className="hover:text-white">How it works</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Contact</h3>
          <ul className="mt-3 space-y-2 text-sm"><li>Dhaka, Bangladesh</li><li>support@microtask.test</li></ul>
        </div>
      </div>
      <div className="border-t border-zinc-800">
        <div className="container-x flex flex-wrap justify-between gap-2 py-5 text-xs">
          <span>© {new Date().getFullYear()} Micro Task. Demo project; payments and withdrawals are simulated.</span>
          <span>{IS_DEMO ? <>Live demo: your data is saved in this browser · <button className="underline underline-offset-2 hover:text-zinc-900" onClick={resetDemoData}>Reset demo data</button></> : 'Built with React, TypeScript, Express'}</span>
        </div>
      </div>
    </footer>
  );
}

export function SiteLayout() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1"><Outlet /></main>
      <Footer />
    </div>
  );
}
