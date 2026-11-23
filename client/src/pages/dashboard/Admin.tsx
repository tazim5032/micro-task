import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, date } from '../../lib/api';
import { useToast } from '../../lib/toast';
import { useAuth } from '../../lib/auth';
import type { Payment, Role, Task, User, Withdrawal } from '../../lib/types';
import { CategoryIcon, Coins, Empty, ErrorNote, Modal, PageTitle, Spinner, StatCard, StatusBadge } from '../../components/ui';

interface Stats {
  totals: { workers: number; creators: number; coinsInCirculation: number; revenueUsd: number; paidOutUsd: number; openTasks: number; pendingReviews: number };
  days: { date: string; submissions: number; approved: number }[];
  pendingWithdrawals: Withdrawal[];
  recentPayments: Payment[];
}

function ActivityChart({ days }: { days: Stats['days'] }) {
  const max = Math.max(1, ...days.map(d => d.submissions));
  const W = 560, H = 150, bw = W / days.length;
  return (
    <svg viewBox={`0 0 ${W} ${H + 22}`} className="w-full" role="img" aria-label="Submissions over the last 14 days">
      <line x1="0" x2={W} y1={H} y2={H} stroke="#e4e4e7" />
      {days.map((d, i) => {
        const h = (d.submissions / max) * (H - 10);
        const ha = (d.approved / max) * (H - 10);
        const x = i * bw + bw * 0.2;
        return (
          <g key={d.date}>
            <rect x={x} y={H - h} width={bw * 0.6} height={Math.max(h, 1)} rx="3" fill="#d4d4d8"><title>{`${d.date}: ${d.submissions} submitted, ${d.approved} approved`}</title></rect>
            <rect x={x} y={H - ha} width={bw * 0.6} height={ha} rx="3" fill="#18181b" />
            {i % 2 === 1 && <text x={x + bw * 0.3} y={H + 15} textAnchor="middle" fontSize="10" fill="#a1a1aa">{new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</text>}
          </g>
        );
      })}
    </svg>
  );
}

function WithdrawalQueue({ list, onDone }: { list: Withdrawal[]; onDone: () => void }) {
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  async function decide(w: Withdrawal, decision: 'approved' | 'rejected') {
    setBusy(w.id);
    try { await api(`/admin/withdrawals/${w.id}`, { method: 'POST', body: { decision } }); toast(decision === 'approved' ? `Approved $${w.amountUsd.toFixed(2)} to ${w.workerName}.` : 'Rejected. Coins returned to the worker.'); onDone(); }
    catch (e) { toast((e as Error).message, 'error'); } finally { setBusy(null); }
  }
  if (list.length === 0) return <p className="border-t border-zinc-100 px-6 py-10 text-center text-sm text-zinc-500">No pending withdrawal requests.</p>;
  return (
    <ul className="divide-y divide-zinc-100 border-t border-zinc-100">
      {list.map(w => (
        <li key={w.id} className="flex flex-wrap items-center gap-4 px-6 py-4">
          <div className="min-w-[180px] flex-1"><p className="text-sm font-medium">{w.workerName}</p><p className="text-xs text-zinc-500">{w.wallet} · <span className="font-mono">{w.accountNumber}</span> · {date(w.createdAt)}</p></div>
          <div className="text-right"><p className="text-sm font-semibold">${w.amountUsd.toFixed(2)}</p><p className="text-xs text-zinc-500"><Coins value={w.coins} className="text-xs" /></p></div>
          <div className="flex gap-2">
            <button className="btn-danger px-3 py-1.5" disabled={busy === w.id} onClick={() => decide(w, 'rejected')}>Reject</button>
            <button className="btn-primary px-3 py-1.5" disabled={busy === w.id} onClick={() => decide(w, 'approved')}>Mark paid</button>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function AdminOverview() {
  const [s, setS] = useState<Stats | null>(null);
  const [error, setError] = useState('');
  const load = useCallback(() => { api<Stats>('/admin/stats').then(setS).catch(e => setError(e.message)); }, []);
  useEffect(() => { load(); }, [load]);
  if (error) return <ErrorNote message={error} />;
  if (!s) return <Spinner />;
  const t = s.totals;
  return (
    <>
      <PageTitle title="Platform overview" subtitle="Users, coins and money flow." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Users" value={t.workers + t.creators} hint={`${t.workers} workers · ${t.creators} creators`} />
        <StatCard label="Coins in circulation" value={<Coins value={t.coinsInCirculation} />} hint="Across all user balances" />
        <StatCard label="Coin sales" value={`$${t.revenueUsd.toFixed(2)}`} hint={`$${t.paidOutUsd.toFixed(2)} paid out to workers`} />
        <StatCard label="Open tasks" value={t.openTasks} hint={`${t.pendingReviews} submissions awaiting review`} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="card p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2"><h2 className="text-base font-semibold">Submissions, last 14 days</h2>
            <span className="flex gap-4 text-xs text-zinc-500"><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-zinc-300" />Submitted</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-zinc-900" />Approved</span></span></div>
          <div className="mt-4"><ActivityChart days={s.days} /></div>
        </div>
        <div className="card overflow-hidden">
          <h2 className="px-6 py-4 text-base font-semibold">Recent coin purchases</h2>
          <ul className="divide-y divide-zinc-100 border-t border-zinc-100">
            {s.recentPayments.map(p => <li key={p.id} className="flex justify-between px-6 py-3 text-sm"><span>{p.userName}<span className="block text-xs text-zinc-500">{date(p.createdAt)}</span></span><span className="text-right font-medium">${p.amountUsd.toFixed(2)}<span className="block text-xs font-normal text-zinc-500"><Coins value={p.coins} className="text-xs" /></span></span></li>)}
          </ul>
        </div>
      </div>
      <div className="card mt-6 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4"><h2 className="text-base font-semibold">Pending withdrawals ({s.pendingWithdrawals.length})</h2><Link to="/dashboard/admin/withdrawals" className="text-sm font-medium text-zinc-500 hover:text-zinc-900">Open queue →</Link></div>
        <WithdrawalQueue list={s.pendingWithdrawals} onDone={load} />
      </div>
    </>
  );
}

export function AdminWithdrawals() {
  const [s, setS] = useState<Stats | null>(null);
  const load = useCallback(() => { api<Stats>('/admin/stats').then(setS); }, []);
  useEffect(() => { load(); }, [load]);
  if (!s) return <Spinner />;
  return (
    <>
      <PageTitle title="Withdrawal requests" subtitle="Send the payment to the worker's wallet, then mark it paid. Rejecting returns the coins." />
      <div className="card overflow-hidden"><WithdrawalQueue list={s.pendingWithdrawals} onDone={load} /></div>
    </>
  );
}

type AdminUser = User & { tasks: number; approved: number };

export function AdminUsers() {
  const toast = useToast();
  const { user: me } = useAuth();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const load = useCallback(() => { api<{ users: AdminUser[] }>('/admin/users').then(r => setUsers(r.users)); }, []);
  useEffect(() => { load(); }, [load]);

  async function update(u: AdminUser, body: { role?: Role; isBlocked?: boolean }) {
    try { await api(`/admin/users/${u.id}`, { method: 'PATCH', body }); toast(body.role ? `${u.name} is now a ${body.role}.` : body.isBlocked ? `${u.name} suspended.` : `${u.name} reactivated.`); load(); }
    catch (e) { toast((e as Error).message, 'error'); }
  }

  if (!users) return <Spinner />;
  const shown = users.filter(u => (!role || u.role === role) && `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageTitle title="Users" subtitle="Change roles or suspend accounts." />
      <div className="mb-4 flex flex-wrap gap-2">
        {['', 'worker', 'creator', 'admin'].map(r => <button key={r || 'all'} onClick={() => setRole(r)} className={`rounded-full px-3.5 py-1.5 text-sm font-medium capitalize ${role === r ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 ring-1 ring-zinc-200'}`}>{r || 'All'}</button>)}
        <input className="input ml-auto w-full sm:w-64" type="search" placeholder="Search name or email…" value={q} onChange={e => setQ(e.target.value)} aria-label="Search users" />
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead className="border-b border-zinc-200 bg-zinc-50"><tr><th className="table-th">User</th><th className="table-th">Role</th><th className="table-th text-right">Coins</th><th className="table-th text-right">Activity</th><th className="table-th">Joined</th><th className="table-th">Status</th><th className="table-th text-right">Action</th></tr></thead>
          <tbody className="divide-y divide-zinc-100">
            {shown.map(u => (
              <tr key={u.id}>
                <td className="table-td"><div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-zinc-100 text-xs font-semibold">{u.name.charAt(0)}</span><div><p className="font-medium text-zinc-900">{u.name}</p><p className="text-xs text-zinc-500">{u.email}</p></div></div></td>
                <td className="table-td">
                  <select className="input w-auto py-1.5 text-xs capitalize" disabled={u.id === me?.id} value={u.role} onChange={e => update(u, { role: e.target.value as Role })} aria-label={`Role for ${u.name}`}>
                    <option value="worker">worker</option><option value="creator">creator</option><option value="admin">admin</option>
                  </select>
                </td>
                <td className="table-td text-right"><Coins value={u.coins} /></td>
                <td className="table-td text-right text-xs">{u.role === 'creator' ? `${u.tasks} tasks` : u.role === 'worker' ? `${u.approved} approved` : '—'}</td>
                <td className="table-td text-xs">{date(u.createdAt)}</td>
                <td className="table-td">{u.isBlocked ? <span className="text-xs font-medium text-red-700">Suspended</span> : <span className="text-xs text-zinc-600">Active</span>}</td>
                <td className="table-td text-right">{u.id === me?.id ? <span className="text-xs text-zinc-400">You</span> : <button className={u.isBlocked ? 'btn-outline px-3 py-1.5' : 'btn-danger px-3 py-1.5'} onClick={() => update(u, { isBlocked: !u.isBlocked })}>{u.isBlocked ? 'Reactivate' : 'Suspend'}</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

type AdminTask = Task & { pending: number };

export function AdminTasks() {
  const toast = useToast();
  const [tasks, setTasks] = useState<AdminTask[] | null>(null);
  const [del, setDel] = useState<AdminTask | null>(null);
  const load = useCallback(() => { api<{ tasks: AdminTask[] }>('/admin/tasks').then(r => setTasks(r.tasks)); }, []);
  useEffect(() => { load(); }, [load]);
  async function remove() {
    try { const r = await api<{ refund: number }>(`/admin/tasks/${del!.id}`, { method: 'DELETE' }); toast(`Task removed. ${r.refund} coins refunded to the creator.`); setDel(null); load(); }
    catch (e) { toast((e as Error).message, 'error'); }
  }
  if (!tasks) return <Spinner />;
  return (
    <>
      <PageTitle title="Tasks" subtitle="Remove tasks that break the rules. Unused coins are refunded to the creator." />
      {tasks.length === 0 ? <Empty title="No tasks" /> : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="border-b border-zinc-200 bg-zinc-50"><tr><th className="table-th">Task</th><th className="table-th">Creator</th><th className="table-th text-right">Pay</th><th className="table-th text-right">Slots</th><th className="table-th">Deadline</th><th className="table-th text-right">Action</th></tr></thead>
            <tbody className="divide-y divide-zinc-100">
              {tasks.map(t => (
                <tr key={t.id}>
                  <td className="table-td"><div className="flex items-center gap-3"><CategoryIcon category={t.category} className="h-8 w-8" /><Link to={`/tasks/${t.id}`} className="font-medium text-zinc-900 hover:underline">{t.title}</Link></div></td>
                  <td className="table-td">{t.creatorName}</td>
                  <td className="table-td text-right"><Coins value={t.payPerWorker} /></td>
                  <td className="table-td text-right text-xs">{t.openSlots} open · {t.pending} pending / {t.totalWorkers}</td>
                  <td className="table-td text-xs">{date(t.deadline)}</td>
                  <td className="table-td text-right"><button className="btn-danger px-3 py-1.5" onClick={() => setDel(t)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={!!del} onClose={() => setDel(null)} title="Remove task?">
        {del && <><p className="text-sm text-zinc-600">Remove “{del.title}”? Pending submissions will be closed, and <b><Coins value={(del.openSlots + del.pending) * del.payPerWorker} /></b> will be refunded to {del.creatorName}. Both will be notified.</p>
          <div className="mt-6 flex justify-end gap-2"><button className="btn-ghost" onClick={() => setDel(null)}>Cancel</button><button className="btn-danger" onClick={remove}>Remove task</button></div></>}
      </Modal>
    </>
  );
}

export { StatusBadge };
