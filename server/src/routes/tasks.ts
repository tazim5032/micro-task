import { Router } from 'express';
import { z } from 'zod';
import { getDB, newId, notify, save } from '../db';
import { auth, HttpError, publicUser, wrap } from '../http';
import { TASK_CATEGORIES, type Task } from '../types';

const router = Router();
const today = () => new Date().toISOString().slice(0, 10);
const isOpen = (t: Task) => t.openSlots > 0 && t.deadline >= today();

// Public: browse open tasks.
router.get('/', wrap((req, res) => {
  const q = z.object({
    search: z.string().trim().optional(),
    category: z.enum(TASK_CATEGORIES).optional(),
    sort: z.enum(['newest', 'pay-desc', 'deadline', 'slots']).default('newest'),
    minPay: z.coerce.number().min(0).optional(),
  }).parse(req.query);
  let items = getDB().tasks.filter(isOpen).filter(t =>
    (!q.search || `${t.title} ${t.detail} ${t.creatorName}`.toLowerCase().includes(q.search.toLowerCase())) &&
    (!q.category || t.category === q.category) && (q.minPay == null || t.payPerWorker >= q.minPay));
  const sorters = {
    newest: (a: Task, b: Task) => b.createdAt.localeCompare(a.createdAt),
    'pay-desc': (a: Task, b: Task) => b.payPerWorker - a.payPerWorker,
    deadline: (a: Task, b: Task) => a.deadline.localeCompare(b.deadline),
    slots: (a: Task, b: Task) => b.openSlots - a.openSlots,
  };
  items = items.sort(sorters[q.sort]);
  res.json({ items, categories: TASK_CATEGORIES });
}));

// Public: home page data.
router.get('/highlights', wrap((_req, res) => {
  const db = getDB();
  const open = db.tasks.filter(isOpen);
  const earned: Record<string, number> = {};
  const done: Record<string, number> = {};
  for (const s of db.submissions.filter(x => x.status === 'approved')) {
    earned[s.workerId] = (earned[s.workerId] ?? 0) + s.payPerWorker;
    done[s.workerId] = (done[s.workerId] ?? 0) + 1;
  }
  const topWorkers = db.users.filter(u => u.role === 'worker' && !u.isBlocked)
    .map(u => ({ id: u.id, name: u.name, coins: u.coins, completed: done[u.id] ?? 0 }))
    .sort((a, b) => b.coins - a.coins).slice(0, 6);
  res.json({
    featured: [...open].sort((a, b) => b.payPerWorker * b.openSlots - a.payPerWorker * a.openSlots).slice(0, 6),
    topWorkers,
    stats: {
      openTasks: open.length,
      workers: db.users.filter(u => u.role === 'worker').length,
      coinsPaid: db.submissions.filter(x => x.status === 'approved').reduce((s, x) => s + x.payPerWorker, 0)
        + db.withdrawals.filter(w => w.status === 'approved').reduce((s, w) => s + w.coins, 0),
    },
  });
}));

router.get('/mine', auth('creator'), wrap((req, res) => {
  const db = getDB();
  const tasks = db.tasks.filter(t => t.creatorId === req.user!.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(t => {
      const subs = db.submissions.filter(s => s.taskId === t.id);
      return { ...t, pending: subs.filter(s => s.status === 'pending').length, approved: subs.filter(s => s.status === 'approved').length };
    });
  res.json({ tasks });
}));

router.get('/:id', wrap((req, res) => {
  const task = getDB().tasks.find(t => t.id === req.params.id);
  if (!task) throw new HttpError(404, 'Task not found.');
  res.json({ task, open: isOpen(task) });
}));

const taskSchema = z.object({
  title: z.string().trim().min(5, 'Title should be at least 5 characters').max(100),
  detail: z.string().trim().min(20, 'Describe the task in at least 20 characters').max(2000),
  category: z.enum(TASK_CATEGORIES),
  submissionInfo: z.string().trim().min(5, 'Tell workers what to submit').max(300),
  totalWorkers: z.coerce.number().int().min(1).max(10000),
  payPerWorker: z.coerce.number().int().min(1, 'Pay at least 1 coin per worker').max(10000),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(d => d >= today(), 'Deadline must be today or later'),
});

router.post('/', auth('creator'), wrap((req, res) => {
  const body = taskSchema.parse(req.body);
  const cost = body.totalWorkers * body.payPerWorker;
  const user = req.user!;
  if (user.coins < cost) throw new HttpError(402, `This task costs ${cost} coins but you have ${user.coins}. Buy more coins first.`);
  user.coins -= cost;
  const task: Task = { ...body, id: newId(), creatorId: user.id, creatorName: user.name, openSlots: body.totalWorkers, createdAt: new Date().toISOString() };
  getDB().tasks.push(task);
  save();
  res.status(201).json({ task, coins: user.coins });
}));

// Only descriptive fields can change after funding.
router.patch('/:id', auth('creator'), wrap((req, res) => {
  const task = getDB().tasks.find(t => t.id === req.params.id && t.creatorId === req.user!.id);
  if (!task) throw new HttpError(404, 'Task not found.');
  Object.assign(task, taskSchema.pick({ title: true, detail: true, submissionInfo: true }).partial().parse(req.body));
  save();
  res.json({ task });
}));

/** Delete a task and refund unused slots (open + pending) to the creator. */
export function removeTask(taskId: string, reason: string) {
  const db = getDB();
  const idx = db.tasks.findIndex(t => t.id === taskId);
  if (idx === -1) throw new HttpError(404, 'Task not found.');
  const task = db.tasks[idx];
  const pending = db.submissions.filter(s => s.taskId === task.id && s.status === 'pending');
  const refund = (task.openSlots + pending.length) * task.payPerWorker;
  for (const s of pending) {
    s.status = 'rejected'; s.feedback = reason; s.reviewedAt = new Date().toISOString();
    notify(s.workerId, `Your submission for “${task.title}” was closed: ${reason}`, '/dashboard/worker/submissions');
  }
  const creator = db.users.find(u => u.id === task.creatorId);
  if (creator) creator.coins += refund;
  db.tasks.splice(idx, 1);
  return { refund, creator };
}

router.delete('/:id', auth('creator'), wrap((req, res) => {
  const task = getDB().tasks.find(t => t.id === req.params.id && t.creatorId === req.user!.id);
  if (!task) throw new HttpError(404, 'Task not found.');
  const { refund } = removeTask(task.id, 'the creator removed this task');
  save();
  res.json({ ok: true, refund, user: publicUser(req.user!) });
}));

export default router;
