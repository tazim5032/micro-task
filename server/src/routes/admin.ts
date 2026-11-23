import { Router } from 'express';
import { z } from 'zod';
import { getDB, notify, save } from '../db';
import { auth, HttpError, publicUser, wrap } from '../http';
import { removeTask } from './tasks';

const router = Router();
router.use(auth('admin'));

router.get('/stats', wrap((_req, res) => {
  const db = getDB();
  const users = db.users.filter(u => u.role !== 'admin');
  // Daily activity for the last 14 days.
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() - (13 - i) * 86400000).toISOString().slice(0, 10);
    return {
      date: d,
      submissions: db.submissions.filter(s => s.createdAt.slice(0, 10) === d).length,
      approved: db.submissions.filter(s => s.status === 'approved' && (s.reviewedAt ?? '').slice(0, 10) === d).length,
    };
  });
  res.json({
    totals: {
      workers: users.filter(u => u.role === 'worker').length,
      creators: users.filter(u => u.role === 'creator').length,
      coinsInCirculation: users.reduce((s, u) => s + u.coins, 0),
      revenueUsd: db.payments.reduce((s, p) => s + p.amountUsd, 0),
      paidOutUsd: db.withdrawals.filter(w => w.status === 'approved').reduce((s, w) => s + w.amountUsd, 0),
      openTasks: db.tasks.filter(t => t.openSlots > 0).length,
      pendingReviews: db.submissions.filter(s => s.status === 'pending').length,
    },
    days,
    pendingWithdrawals: db.withdrawals.filter(w => w.status === 'pending').sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    recentPayments: [...db.payments].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
  });
}));

router.get('/users', wrap((_req, res) => {
  const db = getDB();
  res.json({
    users: db.users.map(u => ({
      ...publicUser(u),
      tasks: db.tasks.filter(t => t.creatorId === u.id).length,
      approved: db.submissions.filter(s => s.workerId === u.id && s.status === 'approved').length,
    })).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  });
}));

router.patch('/users/:id', wrap((req, res) => {
  const body = z.object({ role: z.enum(['admin', 'creator', 'worker']).optional(), isBlocked: z.boolean().optional() }).parse(req.body);
  const user = getDB().users.find(u => u.id === req.params.id);
  if (!user) throw new HttpError(404, 'User not found.');
  if (user.id === req.user!.id) throw new HttpError(400, 'You cannot change your own account here.');
  if (body.role && body.role !== user.role) {
    user.role = body.role;
    notify(user.id, `Your account role was changed to ${body.role}.`);
  }
  if (body.isBlocked !== undefined) user.isBlocked = body.isBlocked;
  save();
  res.json({ user: publicUser(user) });
}));

router.get('/tasks', wrap((_req, res) => {
  const db = getDB();
  res.json({ tasks: [...db.tasks].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(t => ({ ...t, pending: db.submissions.filter(s => s.taskId === t.id && s.status === 'pending').length })) });
}));

router.delete('/tasks/:id', wrap((req, res) => {
  const { refund, creator } = removeTask(String(req.params.id), 'the task was removed by an admin');
  if (creator) notify(creator.id, `An admin removed one of your tasks. ${refund} coins were refunded.`, '/dashboard/creator/tasks');
  save();
  res.json({ ok: true, refund });
}));

router.post('/withdrawals/:id', wrap((req, res) => {
  const { decision } = z.object({ decision: z.enum(['approved', 'rejected']) }).parse(req.body);
  const db = getDB();
  const w = db.withdrawals.find(x => x.id === req.params.id);
  if (!w) throw new HttpError(404, 'Withdrawal not found.');
  if (w.status !== 'pending') throw new HttpError(409, 'This request was already processed.');
  w.status = decision;
  w.processedAt = new Date().toISOString();
  if (decision === 'rejected') {
    const worker = db.users.find(u => u.id === w.workerId);
    if (worker) worker.coins += w.coins; // release the hold
  }
  notify(w.workerId, decision === 'approved'
    ? `Your withdrawal of ${w.coins} coins ($${w.amountUsd.toFixed(2)}) to ${w.wallet} was approved.`
    : `Your withdrawal of ${w.coins} coins was rejected. The coins are back in your balance.`, '/dashboard/worker/withdrawals');
  save();
  res.json({ withdrawal: w });
}));

export default router;
