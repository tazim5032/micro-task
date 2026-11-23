import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api, date } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { useToast } from '../../lib/toast';
import { WALLETS, type Rules, type Submission, type User, type Wallet, type Withdrawal } from '../../lib/types';
import { Coins, Empty, ErrorNote, Modal, PageTitle, Spinner, StatCard, StatusBadge } from '../../components/ui';

function useSubmissions() {
  const [subs, setSubs] = useState<Submission[] | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { api<{ submissions: Submission[] }>('/submissions/mine').then(r => setSubs(r.submissions)).catch(e => setError(e.message)); }, []);
  return { subs, error };
}

export function WorkerOverview() {
  const { user } = useAuth();
  const { subs, error } = useSubmissions();
  if (error) return <ErrorNote message={error} />;
  if (!subs || !user) return <Spinner />;
  const approved = subs.filter(s => s.status === 'approved');
  const pending = subs.filter(s => s.status === 'pending');
  const earned = approved.reduce((s, x) => s + x.payPerWorker, 0);

  return (
    <>
      <PageTitle title={`Hi, ${user.name.split(' ')[0]}`} subtitle="Your earnings and submissions at a glance." action={<Link to="/tasks" className="btn-primary">Find tasks</Link>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Available balance" value={<Coins value={user.coins} />} hint={`≈ $${(user.coins / 20).toFixed(2)}`} />
        <StatCard label="Total earned" value={<Coins value={earned} />} hint={`${approved.length} approved tasks`} />
        <StatCard label="Awaiting review" value={pending.length} hint={pending.length ? <Coins value={pending.reduce((s, x) => s + x.payPerWorker, 0)} className="text-xs" /> : 'Nothing pending'} />
        <StatCard label="Approval rate" value={subs.length ? `${Math.round((approved.length / Math.max(1, subs.filter(s => s.status !== 'pending').length)) * 100)}%` : '—'} hint="Of reviewed submissions" />
      </div>
      {user.coins >= 200 && (
        <div className="card mt-6 flex flex-wrap items-center justify-between gap-4 p-5">
          <p className="text-sm">You can withdraw up to <b>${(user.coins / 20).toFixed(2)}</b> to bKash, Nagad or Rocket.</p>
          <Link to="/dashboard/worker/withdrawals" className="btn-outline">Withdraw now</Link>
        </div>
      )}
      <div className="card mt-6 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4"><h2 className="text-base font-semibold">Recently approved</h2><Link to="/dashboard/worker/submissions" className="text-sm font-medium text-zinc-500 hover:text-zinc-900">All submissions →</Link></div>
        {approved.length === 0 ? <p className="border-t border-zinc-100 px-6 py-8 text-center text-sm text-zinc-500">No approved work yet. <Link to="/tasks" className="underline">Find a task</Link> to get started.</p> : (
          <ul className="divide-y divide-zinc-100 border-t border-zinc-100">
            {approved.slice(0, 5).map(s => (
              <li key={s.id} className="flex items-center justify-between gap-4 px-6 py-3 text-sm">
                <div className="min-w-0"><p className="truncate font-medium">{s.taskTitle}</p><p className="text-xs text-zinc-500">{s.creatorName} · {date(s.reviewedAt ?? s.createdAt)}</p></div>
                <span className="font-semibold">+<Coins value={s.payPerWorker} /></span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export function WorkerSubmissions() {
  const { subs, error } = useSubmissions();
  const [filter, setFilter] = useState('');
  const [view, setView] = useState<Submission | null>(null);
  const shown = useMemo(() => (subs ?? []).filter(s => !filter || s.status === filter), [subs, filter]);
  if (error) return <ErrorNote message={error} />;
  if (!subs) return <Spinner />;
  return (
    <>
      <PageTitle title="My submissions" subtitle="Track the review status of your work." />
      <div className="mb-4 flex flex-wrap gap-2">
        {['', 'pending', 'approved', 'rejected'].map(f => <button key={f || 'all'} onClick={() => setFilter(f)} className={`rounded-full px-3.5 py-1.5 text-sm font-medium capitalize ${filter === f ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 ring-1 ring-zinc-200'}`}>{f || 'All'} ({f ? subs.filter(s => s.status === f).length : subs.length})</button>)}
      </div>
      {shown.length === 0 ? <Empty title="Nothing here yet" action={<Link to="/tasks" className="btn-primary">Find tasks</Link>} /> : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[680px]">
            <thead className="border-b border-zinc-200 bg-zinc-50"><tr><th className="table-th">Task</th><th className="table-th">Creator</th><th className="table-th">Submitted</th><th className="table-th text-right">Reward</th><th className="table-th">Status</th></tr></thead>
            <tbody className="divide-y divide-zinc-100">
              {shown.map(s => (
                <tr key={s.id} className="cursor-pointer hover:bg-zinc-50/60" onClick={() => setView(s)}>
                  <td className="table-td font-medium text-zinc-900">{s.taskTitle}{s.feedback && <p className="mt-0.5 text-xs font-normal text-zinc-500">“{s.feedback}”</p>}</td>
                  <td className="table-td">{s.creatorName}</td>
                  <td className="table-td text-xs">{date(s.createdAt)}</td>
                  <td className="table-td text-right"><Coins value={s.payPerWorker} /></td>
                  <td className="table-td"><StatusBadge status={s.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={!!view} onClose={() => setView(null)} title={view?.taskTitle ?? ''}>
        {view && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-2"><StatusBadge status={view.status} /><span className="text-zinc-500">Submitted {date(view.createdAt)}{view.reviewedAt ? ` · reviewed ${date(view.reviewedAt)}` : ''}</span></div>
            <div><p className="font-medium">Your submission</p><p className="mt-1 whitespace-pre-line rounded-xl bg-zinc-50 p-3 text-zinc-700">{view.details}</p></div>
            {view.feedback && <div><p className="font-medium">Feedback from {view.creatorName}</p><p className="mt-1 text-zinc-700">{view.feedback}</p></div>}
            <Link to={`/tasks/${view.taskId}`} className="btn-outline">View task</Link>
          </div>
        )}
      </Modal>
    </>
  );
}

export function WorkerWithdrawals() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [rules, setRules] = useState<Rules | null>(null);
  const [list, setList] = useState<Withdrawal[] | null>(null);
  const [coins, setCoins] = useState('');
  const [wallet, setWallet] = useState<Wallet>('bKash');
  const [account, setAccount] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => api<{ withdrawals: Withdrawal[] }>('/withdrawals').then(r => setList(r.withdrawals)).catch(e => setError(e.message));
  useEffect(() => { api<Rules>('/config').then(setRules); load(); }, []);
  if (!rules || !list || !user) return <Spinner />;

  const n = Number(coins) || 0;
  const can = user.coins >= rules.minWithdrawCoins;

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const r = await api<{ user: User }>('/withdrawals', { method: 'POST', body: { coins: n, wallet, accountNumber: account } });
      setUser(r.user); setCoins(''); toast('Withdrawal requested. An admin will review it shortly.'); load();
    } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }

  return (
    <>
      <PageTitle title="Withdraw" subtitle={`${rules.coinsPerDollar} coins = $1 · minimum ${rules.minWithdrawCoins} coins`} />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <form className="card h-fit space-y-4 p-6" onSubmit={submit}>
          <div className="rounded-xl bg-zinc-50 p-4"><p className="text-sm text-zinc-500">Available</p><p className="mt-1 text-2xl font-semibold"><Coins value={user.coins} /> <span className="text-base font-normal text-zinc-500">≈ ${(user.coins / rules.coinsPerDollar).toFixed(2)}</span></p></div>
          {!can && <p className="text-sm text-zinc-600">You need at least {rules.minWithdrawCoins} coins to withdraw. Keep completing tasks!</p>}
          {error && <ErrorNote message={error} />}
          <div>
            <label className="label" htmlFor="w-coins">Coins to withdraw</label>
            <div className="flex gap-2">
              <input id="w-coins" type="number" className="input" min={rules.minWithdrawCoins} max={user.coins} step={1} required disabled={!can} value={coins} onChange={e => setCoins(e.target.value)} />
              <button type="button" className="btn-outline" disabled={!can} onClick={() => setCoins(String(user.coins))}>Max</button>
            </div>
            <p className="mt-1.5 text-sm text-zinc-600">You'll receive <b>${(n / rules.coinsPerDollar).toFixed(2)}</b></p>
          </div>
          <div>
            <span className="label">Mobile wallet</span>
            <div className="grid grid-cols-3 gap-2">{WALLETS.map(w => <button type="button" key={w} disabled={!can} onClick={() => setWallet(w)} className={`rounded-lg border-2 py-2 text-sm font-medium ${wallet === w ? 'border-zinc-900' : 'border-zinc-200 text-zinc-500'}`}>{w}</button>)}</div>
          </div>
          <div><label className="label" htmlFor="w-acc">{wallet} number</label><input id="w-acc" className="input font-mono" inputMode="numeric" placeholder="01XXXXXXXXX" pattern="01[0-9]{9}" required disabled={!can} value={account} onChange={e => setAccount(e.target.value)} /></div>
          <button className="btn-primary w-full" disabled={!can || busy || n < rules.minWithdrawCoins || n > user.coins}>{busy ? 'Requesting…' : 'Request withdrawal'}</button>
          <p className="text-xs text-zinc-500">Coins are held while an admin reviews the request and returned if it's rejected. Demo only: no real transfer happens.</p>
        </form>
        <div className="card overflow-hidden">
          <h2 className="px-6 py-4 text-base font-semibold">History</h2>
          {list.length === 0 ? <p className="border-t border-zinc-100 px-6 py-8 text-center text-sm text-zinc-500">No withdrawals yet.</p> : (
            <ul className="divide-y divide-zinc-100 border-t border-zinc-100">
              {list.map(w => (
                <li key={w.id} className="flex items-center justify-between gap-4 px-6 py-3 text-sm">
                  <div><p className="font-medium">${w.amountUsd.toFixed(2)} to {w.wallet}</p><p className="text-xs text-zinc-500"><Coins value={w.coins} className="text-xs" /> · {date(w.createdAt)} · {w.accountNumber.replace(/^(\d{3})\d+(\d{3})$/, '$1•••••$2')}</p></div>
                  <StatusBadge status={w.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
