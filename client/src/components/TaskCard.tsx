import { Link } from 'react-router-dom';
import type { Task } from '../lib/types';
import { CategoryIcon, Coins, daysLeft } from './ui';

export function TaskCard({ task }: { task: Task }) {
  const filled = task.totalWorkers - task.openSlots;
  return (
    <Link to={`/tasks/${task.id}`} className="card group flex flex-col p-5 transition hover:-translate-y-0.5 hover:border-zinc-300">
      <div className="flex items-start gap-3">
        <CategoryIcon category={task.category} />
        <div className="min-w-0">
          <p className="text-xs text-zinc-500">{task.category} · by {task.creatorName}</p>
          <h3 className="mt-0.5 line-clamp-2 font-semibold leading-snug">{task.title}</h3>
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-zinc-600">{task.detail}</p>
      <div className="mt-4">
        <div className="flex justify-between text-xs text-zinc-500"><span>{task.openSlots} of {task.totalWorkers} slots open</span><span>{daysLeft(task.deadline)}</span></div>
        <div className="mt-1.5 h-1.5 rounded-full bg-zinc-100"><div className="h-1.5 rounded-full bg-zinc-900" style={{ width: `${(filled / task.totalWorkers) * 100}%` }} /></div>
      </div>
      <div className="mt-auto flex items-center justify-between pt-5">
        <span className="text-lg font-semibold"><Coins value={task.payPerWorker} /></span>
        <span className="text-sm font-medium text-zinc-500 transition group-hover:text-zinc-900">View task →</span>
      </div>
    </Link>
  );
}

export function TaskCardSkeleton() {
  return (
    <div className="card space-y-3 p-5">
      <div className="flex gap-3"><div className="h-10 w-10 animate-pulse rounded-xl bg-zinc-100" /><div className="h-4 flex-1 animate-pulse rounded bg-zinc-100" /></div>
      <div className="h-3 w-full animate-pulse rounded bg-zinc-100" />
      <div className="h-3 w-2/3 animate-pulse rounded bg-zinc-100" />
    </div>
  );
}
