import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api, date } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useToast } from '../lib/toast';
import { TASK_CATEGORIES, type Task, type TaskCategory } from '../lib/types';
import { TaskCard, TaskCardSkeleton } from '../components/TaskCard';
import { CategoryIcon, Coins, Empty, ErrorNote, Spinner, daysLeft } from '../components/ui';

interface Highlights { featured: Task[]; topWorkers: { id: string; name: string; coins: number; completed: number }[]; stats: { openTasks: number; workers: number; coinsPaid: number } }

const STEPS = {
  worker: [
    ['Sign up as a worker', 'Get 10 free coins and access to every open task.'],
    ['Complete small tasks', 'Follow the instructions and submit your proof of work.'],
    ['Get approved and paid', 'Coins land in your balance the moment a creator approves.'],
    ['Withdraw to your wallet', 'Cash out from 200 coins (20 coins = $1) to bKash, Nagad or Rocket.'],
  ],
  creator: [
    ['Sign up as a task creator', 'Get 50 free coins to post your first task.'],
    ['Post a task', 'Set the number of workers and pay per worker; coins are reserved up front.'],
    ['Review submissions', 'Approve good work to pay the worker, or reject with feedback to reopen the slot.'],
    ['Top up any time', 'Buy coin packages by card. Unused slots are refunded if you delete a task.'],
  ],
};

export function Home() {
  const [h, setH] = useState<Highlights | null>(null);
  useEffect(() => { api<Highlights>('/tasks/highlights').then(setH).catch(() => {}); }, []);

  return (
    <>
      <section className="border-b border-zinc-200 bg-white">
        <div className="container-x grid items-center gap-12 py-16 lg:grid-cols-[1.1fr_1fr] lg:py-24">
          <div>
            <p className="eyebrow">Micro-tasks · Real rewards</p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">Small tasks. Fair pay. Done fast.</h1>
            <p className="mt-5 max-w-lg text-lg text-zinc-600">Earn coins by testing apps, answering surveys and tagging data, or post tasks and get them done by real people in hours.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/tasks" className="btn-primary px-6 py-3">Start earning</Link>
              <Link to="/register?role=creator" className="btn-outline px-6 py-3">Post a task</Link>
            </div>
            {h && (
              <dl className="mt-10 grid max-w-md grid-cols-3 gap-6">
                <div><dt className="text-xs text-zinc-500">Open tasks</dt><dd className="mt-1 text-2xl font-semibold tabular-nums">{h.stats.openTasks}</dd></div>
                <div><dt className="text-xs text-zinc-500">Workers</dt><dd className="mt-1 text-2xl font-semibold tabular-nums">{h.stats.workers}</dd></div>
                <div><dt className="text-xs text-zinc-500">Coins paid out</dt><dd className="mt-1 text-2xl font-semibold tabular-nums">{h.stats.coinsPaid.toLocaleString()}</dd></div>
              </dl>
            )}
          </div>
          <div className="card relative overflow-hidden p-6">
            <p className="eyebrow">Live on the board</p>
            <ul className="mt-4 space-y-3">
              {(h?.featured.slice(0, 4) ?? []).map(t => (
                <li key={t.id}>
                  <Link to={`/tasks/${t.id}`} className="flex items-center gap-3 rounded-xl border border-zinc-200 p-3 transition hover:border-zinc-400">
                    <CategoryIcon category={t.category} />
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{t.title}</p><p className="text-xs text-zinc-500">{t.openSlots} slots · {daysLeft(t.deadline)}</p></div>
                    <span className="text-sm font-semibold"><Coins value={t.payPerWorker} /></span>
                  </Link>
                </li>
              ))}
              {!h && Array.from({ length: 4 }, (_, i) => <li key={i} className="h-16 animate-pulse rounded-xl bg-zinc-100" />)}
            </ul>
          </div>
        </div>
      </section>

      <section className="container-x py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="eyebrow">Featured</p><h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Top-paying tasks</h2></div>
          <Link to="/tasks" className="btn-outline">Browse all tasks →</Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {h ? h.featured.map(t => <TaskCard key={t.id} task={t} />) : Array.from({ length: 6 }, (_, i) => <TaskCardSkeleton key={i} />)}
        </div>
      </section>

      <section className="container-x">
        <div className="card grid gap-px overflow-hidden bg-zinc-200 md:grid-cols-2">
          {(['worker', 'creator'] as const).map(r => (
            <div key={r} className="bg-white p-8">
              <p className="eyebrow">{r === 'worker' ? 'For workers' : 'For task creators'}</p>
              <ol className="mt-5 space-y-4">
                {STEPS[r].map(([t, d], i) => (
                  <li key={t} className="flex gap-4">
                    <span className="grid h-7 w-7 flex-none place-items-center rounded-full border border-zinc-300 text-xs font-semibold">{i + 1}</span>
                    <div><p className="font-medium">{t}</p><p className="text-sm text-zinc-600">{d}</p></div>
                  </li>
                ))}
              </ol>
              <Link to={`/register?role=${r}`} className="btn-primary mt-6">{r === 'worker' ? 'Join as a worker' : 'Join as a creator'}</Link>
            </div>
          ))}
        </div>
      </section>

      {h && h.topWorkers.length > 0 && (
        <section className="container-x pt-16">
          <p className="eyebrow">Leaderboard</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Top earners</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {h.topWorkers.map((w, i) => (
              <div key={w.id} className="card flex items-center gap-4 p-5">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-zinc-100 font-semibold text-zinc-700">{w.name.charAt(0)}</span>
                <div className="min-w-0 flex-1"><p className="truncate font-medium">{w.name}</p><p className="text-xs text-zinc-500">{w.completed} tasks approved</p></div>
                <div className="text-right"><p className="text-xs text-zinc-400">#{i + 1}</p><p className="font-semibold"><Coins value={w.coins} /></p></div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="container-x pt-16">
        <p className="eyebrow">What people say</p>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {[
            ['I test apps during my commute and withdraw to bKash every couple of weeks.', 'Farhana A.', 'Worker'],
            ['We got 40 survey responses in a single afternoon. Reviewing submissions is quick.', 'Nusrat J.', 'Task creator'],
            ['Clear instructions, honest reviews and the coins show up instantly after approval.', 'Rakib H.', 'Worker'],
          ].map(([q, n, r]) => (
            <figure key={n} className="card p-6">
              <blockquote className="text-sm leading-relaxed text-zinc-700">“{q}”</blockquote>
              <figcaption className="mt-4 text-sm"><b>{n}</b> <span className="text-zinc-500">· {r}</span></figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-3 text-xs text-zinc-400">Sample testimonials for this demo.</p>
      </section>
    </>
  );
}

export function HowItWorks() {
  return (
    <div className="container-x py-14">
      <p className="eyebrow">How it works</p>
      <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">A fair marketplace for small online tasks.</h1>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {(['worker', 'creator'] as const).map(r => (
          <div key={r} className="card p-7">
            <h2 className="text-lg font-semibold">{r === 'worker' ? 'Workers' : 'Task creators'}</h2>
            <ol className="mt-4 space-y-3 text-sm text-zinc-600">{STEPS[r].map(([t, d], i) => <li key={t}><b className="text-zinc-900">{i + 1}. {t}.</b> {d}</li>)}</ol>
          </div>
        ))}
      </div>
      <div className="card mt-6 p-7">
        <h2 className="text-lg font-semibold">Coins and money</h2>
        <ul className="mt-3 grid gap-2 text-sm text-zinc-600 sm:grid-cols-2">
          <li>• Creators buy coins: 10 for $1, 150 for $10, 500 for $20, 1000 for $35.</li>
          <li>• Workers withdraw at 20 coins = $1, from 200 coins.</li>
          <li>• Task cost (workers × pay) is reserved when a task is posted.</li>
          <li>• Rejected work reopens the slot; deleted tasks refund unused coins.</li>
        </ul>
        <p className="mt-4 text-xs text-zinc-500">This is a portfolio demo by Mohammad Fakhrul Islam: payments and withdrawals are simulated.</p>
      </div>
    </div>
  );
}

export function Tasks() {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState<Task[] | null>(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState(params.get('search') ?? '');
  const category = params.get('category') ?? '';
  const sort = params.get('sort') ?? 'newest';

  useEffect(() => {
    const t = setTimeout(() => {
      setError('');
      api<{ items: Task[] }>('/tasks', { query: { search, category, sort } }).then(r => setItems(r.items)).catch(e => setError(e.message));
    }, 200);
    return () => clearTimeout(t);
  }, [search, category, sort]);

  const set = (k: string, v: string) => { const n = new URLSearchParams(params); if (v) n.set(k, v); else n.delete(k); setParams(n, { replace: true }); };

  return (
    <div className="container-x py-10">
      <p className="eyebrow">Task board</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="text-3xl font-semibold tracking-tight">Find tasks</h1><p className="mt-1 text-sm text-zinc-500">{items ? `${items.length} open ${items.length === 1 ? 'task' : 'tasks'}` : 'Loading…'}</p></div>
        <div className="flex w-full gap-2 sm:w-auto">
          <input className="input sm:w-72" type="search" placeholder="Search tasks…" value={search} onChange={e => setSearch(e.target.value)} aria-label="Search tasks" />
          <select className="input w-auto" value={sort} onChange={e => set('sort', e.target.value === 'newest' ? '' : e.target.value)} aria-label="Sort">
            <option value="newest">Newest</option><option value="pay-desc">Highest pay</option><option value="deadline">Ending soon</option><option value="slots">Most slots</option>
          </select>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {['', ...TASK_CATEGORIES].map(c => (
          <button key={c || 'all'} onClick={() => set('category', c)} className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${category === c ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 ring-1 ring-zinc-200 hover:text-zinc-900'}`}>{c || 'All'}</button>
        ))}
      </div>
      <div className="mt-8">
        {error && <ErrorNote message={error} />}
        {!items && !error && <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <TaskCardSkeleton key={i} />)}</div>}
        {items && items.length === 0 && <Empty title="No open tasks match" action={<button className="btn-outline" onClick={() => { setSearch(''); setParams({}, { replace: true }); }}>Clear filters</button>}>Try another category or search term.</Empty>}
        {items && items.length > 0 && <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map(t => <TaskCard key={t.id} task={t} />)}</div>}
      </div>
    </div>
  );
}

export function TaskDetails() {
  const { id } = useParams();
  const { user, refresh } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [data, setData] = useState<{ task: Task; open: boolean } | null>(null);
  const [error, setError] = useState('');
  const [details, setDetails] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { api<{ task: Task; open: boolean }>(`/tasks/${id}`).then(setData).catch(e => setError(e.message)); }, [id]);

  if (error) return <div className="container-x py-16"><Empty title="Task not found" action={<Link to="/tasks" className="btn-outline">Back to tasks</Link>}>{error}</Empty></div>;
  if (!data) return <Spinner label="Loading task" />;
  const { task, open } = data;

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setSubmitError('');
    try {
      await api('/submissions', { method: 'POST', body: { taskId: task.id, details } });
      toast('Submitted! You will be notified when it is reviewed.');
      refresh();
      navigate('/dashboard/worker/submissions');
    } catch (err) { setSubmitError((err as Error).message); setBusy(false); }
  }

  return (
    <div className="container-x py-10">
      <Link to="/tasks" className="text-sm text-zinc-500 hover:text-zinc-900">← All tasks</Link>
      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="card p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <CategoryIcon category={task.category as TaskCategory} className="h-12 w-12" />
            <div><p className="text-sm text-zinc-500">{task.category} · posted by {task.creatorName}</p><h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{task.title}</h1></div>
          </div>
          <h2 className="mt-8 text-sm font-semibold">What to do</h2>
          <p className="mt-2 whitespace-pre-line leading-relaxed text-zinc-700">{task.detail}</p>
          <h2 className="mt-6 text-sm font-semibold">What to submit</h2>
          <p className="mt-2 rounded-xl bg-zinc-50 p-4 text-sm text-zinc-700">{task.submissionInfo}</p>
        </div>
        <aside className="space-y-4">
          <div className="card p-6">
            <p className="text-sm text-zinc-500">Reward per approved submission</p>
            <p className="mt-1 text-3xl font-semibold"><Coins value={task.payPerWorker} /></p>
            <dl className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-zinc-500">Open slots</dt><dd>{task.openSlots} of {task.totalWorkers}</dd></div>
              <div className="flex justify-between"><dt className="text-zinc-500">Deadline</dt><dd>{date(task.deadline)} · {daysLeft(task.deadline)}</dd></div>
            </dl>
          </div>
          <div className="card p-6">
            {!open ? <p className="text-sm text-zinc-600">This task is no longer accepting submissions.</p>
              : !user ? (<><p className="text-sm text-zinc-600">Log in as a worker to submit this task.</p><Link to="/login" state={{ from: `/tasks/${task.id}` }} className="btn-primary mt-4 w-full">Log in to submit</Link></>)
              : user.role !== 'worker' ? <p className="text-sm text-zinc-600">Only worker accounts can submit tasks. You're signed in as a {user.role}.</p>
              : (
                <form onSubmit={submit} className="space-y-3">
                  <label className="label" htmlFor="proof">Your submission</label>
                  {submitError && <ErrorNote message={submitError} />}
                  <textarea id="proof" className="input min-h-[140px]" required minLength={5} placeholder={task.submissionInfo} value={details} onChange={e => setDetails(e.target.value)} />
                  <button className="btn-primary w-full" disabled={busy}>{busy ? 'Submitting…' : 'Submit work'}</button>
                </form>
              )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export function NotFound() {
  return (
    <div className="container-x flex flex-col items-center py-24 text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">This page doesn't exist</h1>
      <Link to="/" className="btn-primary mt-6">Back to home</Link>
    </div>
  );
}
