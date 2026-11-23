import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, date } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { useToast } from '../../lib/toast';
import { TASK_CATEGORIES, type Payment, type Rules, type Submission, type Task, type TaskCategory, type User } from '../../lib/types';
import { CategoryIcon, Coins, Empty, ErrorNote, Modal, PageTitle, Spinner, StatCard, daysLeft } from '../../components/ui';

type MyTask = Task & { pending: number; approved: number };

/* ---------- Overview + review queue ---------- */

export function CreatorOverview() {
  const { user, refresh } = useAuth();
  const toast = useToast();
  const [tasks, setTasks] = useState<MyTask[] | null>(null);
  const [queue, setQueue] = useState<Submission[] | null>(null);
  const [error, setError] = useState('');
  const [reviewing, setReviewing] = useState<Submission | null>(null);
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api<{ tasks: MyTask[] }>('/tasks/mine').then(r => setTasks(r.tasks)).catch(e => setError(e.message));
    api<{ submissions: Submission[] }>('/submissions/to-review').then(r => setQueue(r.submissions)).catch(e => setError(e.message));
  }, []);
  useEffect(() => { load(); }, [load]);

  async function decide(decision: 'approved' | 'rejected') {
    if (!reviewing) return;
    setBusy(true);
    try {
      await api(`/submissions/${reviewing.id}/review`, { method: 'POST', body: { decision, feedback: feedback || undefined } });
      toast(decision === 'approved' ? `Approved. ${reviewing.workerName} was paid ${reviewing.payPerWorker} coins.` : 'Rejected. The slot is open again.');
      setReviewing(null); setFeedback(''); load(); refresh();
    } catch (e) { toast((e as Error).message, 'error'); } finally { setBusy(false); }
  }

  if (error) return <ErrorNote message={error} />;
  if (!tasks || !queue || !user) return <Spinner />;
  const reserved = tasks.reduce((s, t) => s + (t.openSlots + t.pending) * t.payPerWorker, 0);
  const paid = tasks.reduce((s, t) => s + t.approved * t.payPerWorker, 0);

  return (
    <>
      <PageTitle title={`Hi, ${user.name.split(' ')[0]}`} subtitle="Review work and keep your tasks moving." action={<Link to="/dashboard/creator/new" className="btn-primary">+ Post a task</Link>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Coin balance" value={<Coins value={user.coins} />} hint={<Link to="/dashboard/creator/coins" className="underline">Buy more</Link>} />
        <StatCard label="Reserved in active tasks" value={<Coins value={reserved} />} hint="Open + pending slots" />
        <StatCard label="Paid to workers" value={<Coins value={paid} />} hint={`${tasks.reduce((s, t) => s + t.approved, 0)} approved submissions`} />
        <StatCard label="Waiting for review" value={queue.length} hint={`${tasks.length} tasks posted`} />
      </div>

      <div className="card mt-6 overflow-hidden">
        <div className="px-6 py-4"><h2 className="text-base font-semibold">Submissions to review</h2><p className="text-sm text-zinc-500">Oldest first. Approving pays the worker from the task's reserved coins.</p></div>
        {queue.length === 0 ? <p className="border-t border-zinc-100 px-6 py-10 text-center text-sm text-zinc-500">You're all caught up. 🎉</p> : (
          <ul className="divide-y divide-zinc-100 border-t border-zinc-100">
            {queue.map(s => (
              <li key={s.id} className="flex flex-wrap items-center gap-4 px-6 py-4">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-zinc-100 text-sm font-semibold">{s.workerName.charAt(0)}</span>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{s.workerName} <span className="font-normal text-zinc-500">on</span> {s.taskTitle}</p><p className="truncate text-xs text-zinc-500">{s.details}</p></div>
                <span className="text-sm"><Coins value={s.payPerWorker} /></span>
                <button className="btn-outline px-3 py-1.5" onClick={() => { setReviewing(s); setFeedback(''); }}>Review</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal open={!!reviewing} onClose={() => setReviewing(null)} title="Review submission">
        {reviewing && (
          <div className="space-y-4 text-sm">
            <div><p className="text-zinc-500">Task</p><p className="font-medium">{reviewing.taskTitle}</p></div>
            <div><p className="text-zinc-500">Worker</p><p className="font-medium">{reviewing.workerName} <span className="font-normal text-zinc-500">({reviewing.workerEmail}) · {date(reviewing.createdAt)}</span></p></div>
            <div><p className="text-zinc-500">Submission</p><p className="mt-1 whitespace-pre-line rounded-xl bg-zinc-50 p-3 text-zinc-800">{reviewing.details}</p></div>
            <div><label className="label" htmlFor="fb">Feedback (required to reject)</label><input id="fb" className="input" maxLength={300} placeholder="e.g. The screenshot link is missing" value={feedback} onChange={e => setFeedback(e.target.value)} /></div>
            <div className="flex gap-2 pt-2">
              <button className="btn-danger flex-1" disabled={busy || !feedback.trim()} onClick={() => decide('rejected')}>Reject</button>
              <button className="btn-primary flex-1" disabled={busy} onClick={() => decide('approved')}>Approve & pay <Coins value={reviewing.payPerWorker} /></button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

/* ---------- Post a task ---------- */

export function NewTask() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const tomorrow = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const [f, setF] = useState({ title: '', detail: '', category: 'Testing' as TaskCategory, submissionInfo: '', totalWorkers: 10, payPerWorker: 10, deadline: tomorrow });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (!user) return <Spinner />;
  const cost = (Number(f.totalWorkers) || 0) * (Number(f.payPerWorker) || 0);
  const short = cost > user.coins;

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const r = await api<{ task: Task; coins: number }>('/tasks', { method: 'POST', body: f });
      setUser({ ...user!, coins: r.coins } as User);
      toast(`Task posted. ${cost} coins reserved.`);
      navigate('/dashboard/creator/tasks');
    } catch (err) { setError((err as Error).message); setBusy(false); }
  }

  return (
    <>
      <PageTitle title="Post a task" subtitle="Clear instructions get better submissions." />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <form id="task-form" className="card space-y-5 p-6" onSubmit={submit}>
          {error && <ErrorNote message={error} />}
          <div><label className="label" htmlFor="t-title">Title</label><input id="t-title" className="input" required minLength={5} maxLength={100} placeholder="e.g. Test our checkout on mobile" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} /></div>
          <div><label className="label" htmlFor="t-cat">Category</label><select id="t-cat" className="input" value={f.category} onChange={e => setF({ ...f, category: e.target.value as TaskCategory })}>{TASK_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
          <div><label className="label" htmlFor="t-detail">Instructions</label><textarea id="t-detail" className="input min-h-[120px]" required minLength={20} placeholder="Explain exactly what workers should do." value={f.detail} onChange={e => setF({ ...f, detail: e.target.value })} /></div>
          <div><label className="label" htmlFor="t-sub">What should workers submit?</label><input id="t-sub" className="input" required minLength={5} placeholder="e.g. A screenshot link and your username" value={f.submissionInfo} onChange={e => setF({ ...f, submissionInfo: e.target.value })} /></div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div><label className="label" htmlFor="t-n">Workers needed</label><input id="t-n" type="number" className="input" min={1} required value={f.totalWorkers} onChange={e => setF({ ...f, totalWorkers: Number(e.target.value) })} /></div>
            <div><label className="label" htmlFor="t-pay">Coins per worker</label><input id="t-pay" type="number" className="input" min={1} required value={f.payPerWorker} onChange={e => setF({ ...f, payPerWorker: Number(e.target.value) })} /></div>
            <div><label className="label" htmlFor="t-dl">Deadline</label><input id="t-dl" type="date" className="input" required min={new Date().toISOString().slice(0, 10)} value={f.deadline} onChange={e => setF({ ...f, deadline: e.target.value })} /></div>
          </div>
        </form>
        <aside className="card h-fit p-6 lg:sticky lg:top-24">
          <h2 className="text-base font-semibold">Cost</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-zinc-500">{f.totalWorkers || 0} workers × {f.payPerWorker || 0} coins</dt><dd><Coins value={cost} /></dd></div>
            <div className="flex justify-between"><dt className="text-zinc-500">Your balance</dt><dd><Coins value={user.coins} /></dd></div>
            <div className="flex justify-between border-t border-zinc-100 pt-2 font-semibold"><dt>Balance after</dt><dd className={short ? 'text-red-700' : ''}><Coins value={user.coins - cost} /></dd></div>
          </dl>
          {short ? (
            <><p className="mt-4 text-sm text-red-700">You need {cost - user.coins} more coins.</p><Link to="/dashboard/creator/coins" className="btn-primary mt-3 w-full">Buy coins</Link></>
          ) : <button form="task-form" className="btn-primary mt-5 w-full" disabled={busy || cost <= 0}>{busy ? 'Posting…' : 'Post task'}</button>}
          <p className="mt-3 text-xs text-zinc-500">Coins are reserved now. Unused slots are refunded if you delete the task.</p>
        </aside>
      </div>
    </>
  );
}

/* ---------- My tasks ---------- */

export function MyTasks() {
  const { setUser } = useAuth();
  const toast = useToast();
  const [tasks, setTasks] = useState<MyTask[] | null>(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<MyTask | null>(null);
  const [deleting, setDeleting] = useState<MyTask | null>(null);
  const [edit, setEdit] = useState({ title: '', detail: '', submissionInfo: '' });
  const load = useCallback(() => { api<{ tasks: MyTask[] }>('/tasks/mine').then(r => setTasks(r.tasks)).catch(e => setError(e.message)); }, []);
  useEffect(() => { load(); }, [load]);

  async function saveEdit(e: FormEvent) {
    e.preventDefault();
    try { await api(`/tasks/${editing!.id}`, { method: 'PATCH', body: edit }); toast('Task updated.'); setEditing(null); load(); }
    catch (err) { toast((err as Error).message, 'error'); }
  }
  async function remove() {
    try { const r = await api<{ refund: number; user: User }>(`/tasks/${deleting!.id}`, { method: 'DELETE' }); setUser(r.user); toast(`Task deleted. ${r.refund} coins refunded.`); setDeleting(null); load(); }
    catch (err) { toast((err as Error).message, 'error'); }
  }

  if (error) return <ErrorNote message={error} />;
  if (!tasks) return <Spinner />;
  return (
    <>
      <PageTitle title="My tasks" subtitle={`${tasks.length} tasks`} action={<Link to="/dashboard/creator/new" className="btn-primary">+ Post a task</Link>} />
      {tasks.length === 0 ? <Empty title="No tasks yet" action={<Link to="/dashboard/creator/new" className="btn-primary">Post your first task</Link>}>Post a task and workers will start submitting within hours.</Empty> : (
        <div className="space-y-3">
          {tasks.map(t => {
            const filled = t.totalWorkers - t.openSlots;
            const ended = t.deadline < new Date().toISOString().slice(0, 10);
            return (
              <div key={t.id} className="card flex flex-wrap items-center gap-4 p-4">
                <CategoryIcon category={t.category} />
                <div className="min-w-[200px] flex-1">
                  <Link to={`/tasks/${t.id}`} className="font-medium hover:underline">{t.title}</Link>
                  <p className="text-xs text-zinc-500">{t.category} · {ended ? 'Deadline passed' : daysLeft(t.deadline)} · <Coins value={t.payPerWorker} className="text-xs" /> each</p>
                  <div className="mt-2 h-1.5 max-w-xs rounded-full bg-zinc-100"><div className="h-1.5 rounded-full bg-zinc-900" style={{ width: `${(filled / t.totalWorkers) * 100}%` }} /></div>
                </div>
                <dl className="grid grid-cols-3 gap-6 text-center text-sm">
                  <div><dt className="text-xs text-zinc-500">Approved</dt><dd className="font-semibold">{t.approved}</dd></div>
                  <div><dt className="text-xs text-zinc-500">Pending</dt><dd className="font-semibold">{t.pending}</dd></div>
                  <div><dt className="text-xs text-zinc-500">Open</dt><dd className="font-semibold">{t.openSlots}</dd></div>
                </dl>
                <div className="flex gap-1">
                  <button className="btn-ghost px-3 py-1.5" onClick={() => { setEditing(t); setEdit({ title: t.title, detail: t.detail, submissionInfo: t.submissionInfo }); }}>Edit</button>
                  <button className="btn-ghost px-3 py-1.5 text-red-700 hover:bg-red-50 hover:text-red-700" onClick={() => setDeleting(t)}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit task">
        <form className="space-y-4" onSubmit={saveEdit}>
          <div><label className="label" htmlFor="e-title">Title</label><input id="e-title" className="input" required minLength={5} value={edit.title} onChange={e => setEdit({ ...edit, title: e.target.value })} /></div>
          <div><label className="label" htmlFor="e-detail">Instructions</label><textarea id="e-detail" className="input min-h-[110px]" required minLength={20} value={edit.detail} onChange={e => setEdit({ ...edit, detail: e.target.value })} /></div>
          <div><label className="label" htmlFor="e-sub">What to submit</label><input id="e-sub" className="input" required minLength={5} value={edit.submissionInfo} onChange={e => setEdit({ ...edit, submissionInfo: e.target.value })} /></div>
          <p className="text-xs text-zinc-500">Workers, pay and deadline are fixed once a task is funded.</p>
          <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setEditing(null)}>Cancel</button><button className="btn-primary">Save</button></div>
        </form>
      </Modal>
      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete task?">
        {deleting && (
          <>
            <p className="text-sm text-zinc-600">“{deleting.title}” will be removed. Pending submissions will be closed and <b><Coins value={(deleting.openSlots + deleting.pending) * deleting.payPerWorker} /></b> refunded to you. This can't be undone.</p>
            <div className="mt-6 flex justify-end gap-2"><button className="btn-ghost" onClick={() => setDeleting(null)}>Keep task</button><button className="btn-danger" onClick={remove}>Delete & refund</button></div>
          </>
        )}
      </Modal>
    </>
  );
}

/* ---------- Buy coins (simulated card checkout) ---------- */

export function BuyCoins() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [rules, setRules] = useState<Rules | null>(null);
  const [pkg, setPkg] = useState<Rules['packages'][number] | null>(null);
  const [card, setCard] = useState('4242 4242 4242 4242');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  useEffect(() => { api<Rules>('/config').then(setRules); }, []);
  if (!rules || !user) return <Spinner />;

  async function pay(outcome: 'success' | 'declined') {
    setBusy(outcome); setError('');
    await new Promise(r => setTimeout(r, 700));
    try {
      const r = await api<{ user: User }>('/purchase', { method: 'POST', body: { packageId: pkg!.id, cardNumber: card, outcome } });
      setUser(r.user); toast(`${pkg!.coins} coins added to your balance.`); setPkg(null);
    } catch (e) { setError((e as Error).message); } finally { setBusy(null); }
  }

  return (
    <>
      <PageTitle title="Buy coins" subtitle="Coins fund your tasks. Pick a package." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {rules.packages.map((p, i) => (
          <div key={p.id} className={`card relative flex flex-col p-6 ${i === 2 ? 'border-zinc-900 ring-1 ring-zinc-900' : ''}`}>
            {i === 2 && <span className="absolute -top-2.5 left-6 rounded-full bg-zinc-900 px-2.5 py-0.5 text-xs font-medium text-white">Best value</span>}
            <p className="text-3xl font-semibold"><Coins value={p.coins} /></p>
            <p className="mt-1 text-sm text-zinc-500">{(p.price / p.coins * 100).toFixed(1)}¢ per coin</p>
            <p className="mt-6 text-2xl font-semibold">${p.price}</p>
            <button className={`${i === 2 ? 'btn-primary' : 'btn-outline'} mt-4`} onClick={() => { setPkg(p); setError(''); }}>Buy</button>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-zinc-500">Current balance: <Coins value={user.coins} />. See <Link to="/dashboard/creator/payments" className="underline">payment history</Link>.</p>

      <Modal open={!!pkg} onClose={() => !busy && setPkg(null)} title="Checkout">
        {pkg && (
          <div className="space-y-4">
            <div className="rounded-lg bg-zinc-900 px-3 py-2 text-center text-xs font-medium text-zinc-200">Test mode · simulated card payment, no money is charged</div>
            <div className="flex items-center justify-between rounded-xl bg-zinc-50 p-4"><span><Coins value={pkg.coins} className="font-semibold" /> coins</span><span className="text-xl font-semibold">${pkg.price.toFixed(2)}</span></div>
            {error && <ErrorNote message={error} />}
            <div><label className="label" htmlFor="card">Card number</label><input id="card" className="input font-mono" value={card} onChange={e => setCard(e.target.value)} /><p className="mt-1 text-xs text-zinc-500">Use the test card 4242 4242 4242 4242.</p></div>
            <div className="grid grid-cols-2 gap-3"><input className="input font-mono" value="12 / 30" readOnly aria-label="Expiry" /><input className="input font-mono" value="123" readOnly aria-label="CVC" /></div>
            <button className="btn-primary w-full py-3" disabled={!!busy} onClick={() => pay('success')}>{busy === 'success' ? 'Processing…' : `Pay $${pkg.price.toFixed(2)}`}</button>
            <button className="btn-ghost w-full text-xs" disabled={!!busy} onClick={() => pay('declined')}>Simulate a declined card</button>
          </div>
        )}
      </Modal>
    </>
  );
}

export function Payments() {
  const [list, setList] = useState<Payment[] | null>(null);
  useEffect(() => { api<{ payments: Payment[] }>('/payments').then(r => setList(r.payments)); }, []);
  if (!list) return <Spinner />;
  return (
    <>
      <PageTitle title="Payment history" subtitle={`$${list.reduce((s, p) => s + p.amountUsd, 0).toFixed(2)} spent on ${list.reduce((s, p) => s + p.coins, 0).toLocaleString()} coins`} action={<Link to="/dashboard/creator/coins" className="btn-primary">Buy coins</Link>} />
      {list.length === 0 ? <Empty title="No payments yet" /> : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead className="border-b border-zinc-200 bg-zinc-50"><tr><th className="table-th">Date</th><th className="table-th">Reference</th><th className="table-th">Card</th><th className="table-th text-right">Coins</th><th className="table-th text-right">Amount</th></tr></thead>
            <tbody className="divide-y divide-zinc-100">
              {list.map(p => (
                <tr key={p.id}><td className="table-td">{date(p.createdAt)}</td><td className="table-td font-mono text-xs">{p.reference}</td><td className="table-td">•••• {p.cardLast4}</td><td className="table-td text-right"><Coins value={p.coins} /></td><td className="table-td text-right font-medium">${p.amountUsd.toFixed(2)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
