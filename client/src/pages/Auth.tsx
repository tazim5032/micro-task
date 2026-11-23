import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { DEMO, homeFor, useAuth } from '../lib/auth';
import { useToast } from '../lib/toast';
import type { Role, User } from '../lib/types';
import { ErrorNote } from '../components/ui';

function Shell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="container-x grid min-h-[calc(100vh-4rem)] items-center gap-12 py-12 lg:grid-cols-2">
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-zinc-500">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </div>
      <div className="hidden rounded-3xl bg-zinc-900 p-12 text-white lg:block">
        <p className="text-sm text-zinc-400">This week on Micro Task</p>
        <ul className="mt-6 space-y-3">
          {[['Survey responses collected', '1,240'], ['Bugs reported by testers', '86'], ['Coins withdrawn to wallets', '9,800']].map(([k, v]) => (
            <li key={k} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3"><span className="text-zinc-300">{k}</span><b>{v}</b></li>
          ))}
        </ul>
        <p className="mt-8 text-2xl font-semibold tracking-tight">Real people. Small tasks. Fair pay.</p>
        <p className="mt-2 text-sm text-zinc-500">Sample figures for this demo.</p>
      </div>
    </div>
  );
}

function useAfterLogin() {
  const navigate = useNavigate();
  const toast = useToast();
  const from = (useLocation().state as { from?: string } | null)?.from;
  return (u: User, msg: string) => { toast(msg); navigate(from && !from.startsWith('/dashboard') ? from : homeFor(u.role), { replace: true }); };
}

export function Login() {
  const { login } = useAuth();
  const done = useAfterLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function go(e: string, p: string) {
    setBusy(true); setError('');
    try { const u = await login(e, p); done(u, `Welcome back, ${u.name.split(' ')[0]}!`); }
    catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }

  return (
    <Shell title="Log in" subtitle="Welcome back. Pick up where you left off.">
      <form className="space-y-4" onSubmit={(e: FormEvent) => { e.preventDefault(); go(email, password); }}>
        {error && <ErrorNote message={error} />}
        <div><label className="label" htmlFor="email">Email</label><input id="email" type="email" className="input" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></div>
        <div><label className="label" htmlFor="pw">Password</label><input id="pw" type="password" className="input" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></div>
        <button className="btn-primary w-full py-3" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
      </form>
      <div className="mt-6 rounded-xl border border-dashed border-zinc-300 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Try the demo as</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {(Object.keys(DEMO) as Role[]).map(r => <button key={r} className="btn-outline px-2 py-2 text-xs" disabled={busy} onClick={() => go(DEMO[r].email, DEMO[r].password)}>{DEMO[r].label}</button>)}
        </div>
      </div>
      <p className="mt-6 text-sm text-zinc-500">New here? <Link to="/register" className="font-medium text-zinc-900 underline underline-offset-4">Create a free account</Link></p>
    </Shell>
  );
}

export function Register() {
  const { register } = useAuth();
  const done = useAfterLogin();
  const [params] = useSearchParams();
  const [role, setRole] = useState<'worker' | 'creator'>(params.get('role') === 'creator' ? 'creator' : 'worker');
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (f.password !== f.confirm) return setError('Passwords do not match.');
    setBusy(true); setError('');
    try { const u = await register(f.name, f.email, f.password, role); done(u, `Account created. You received ${u.coins} free coins!`); }
    catch (err) { setError((err as Error).message); setBusy(false); }
  }

  return (
    <Shell title="Create your account" subtitle="Free to join. Choose how you'll use Micro Task.">
      <form className="space-y-4" onSubmit={submit}>
        {error && <ErrorNote message={error} />}
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Account type">
          {([['worker', 'I want to earn', '10 free coins'], ['creator', 'I want to post tasks', '50 free coins']] as const).map(([r, t, d]) => (
            <button type="button" key={r} role="radio" aria-checked={role === r} onClick={() => setRole(r)} className={`rounded-xl border-2 p-4 text-left transition ${role === r ? 'border-zinc-900' : 'border-zinc-200 hover:border-zinc-400'}`}>
              <p className="text-sm font-semibold">{t}</p><p className="mt-0.5 text-xs text-zinc-500">{r === 'worker' ? 'Worker' : 'Task creator'} · {d}</p>
            </button>
          ))}
        </div>
        <div><label className="label" htmlFor="name">Full name</label><input id="name" className="input" autoComplete="name" required minLength={2} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></div>
        <div><label className="label" htmlFor="remail">Email</label><input id="remail" type="email" className="input" autoComplete="email" required value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="rpw">Password</label><input id="rpw" type="password" className="input" autoComplete="new-password" minLength={8} required value={f.password} onChange={e => setF({ ...f, password: e.target.value })} /></div>
          <div><label className="label" htmlFor="rpw2">Confirm</label><input id="rpw2" type="password" className="input" autoComplete="new-password" minLength={8} required value={f.confirm} onChange={e => setF({ ...f, confirm: e.target.value })} /></div>
        </div>
        <button className="btn-primary w-full py-3" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
      </form>
      <p className="mt-6 text-sm text-zinc-500">Already have an account? <Link to="/login" className="font-medium text-zinc-900 underline underline-offset-4">Log in</Link></p>
    </Shell>
  );
}
