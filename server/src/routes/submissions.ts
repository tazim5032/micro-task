import { Router } from 'express';
import { z } from 'zod';
import { getDB, newId, notify, save } from '../db';
import { auth, HttpError, wrap } from '../http';
import type { Submission } from '../types';

const router = Router();

// Worker submits proof of work; this holds one slot until reviewed.
router.post('/', auth('worker'), wrap((req, res) => {
  const body = z.object({ taskId: z.string().min(1), details: z.string().trim().min(5, 'Add your proof of work').max(2000) }).parse(req.body);
  const db = getDB();
  const task = db.tasks.find(t => t.id === body.taskId);
  if (!task) throw new HttpError(404, 'This task no longer exists.');
  if (task.deadline < new Date().toISOString().slice(0, 10)) throw new HttpError(409, 'The deadline for this task has passed.');
  if (task.openSlots <= 0) throw new HttpError(409, 'All slots for this task are taken.');
  const w = req.user!;
  if (db.submissions.some(s => s.taskId === task.id && s.workerId === w.id && s.status !== 'rejected'))
    throw new HttpError(409, 'You have already submitted this task.');
  task.openSlots -= 1;
  const sub: Submission = {
    id: newId(), taskId: task.id, taskTitle: task.title, payPerWorker: task.payPerWorker, creatorId: task.creatorId, creatorName: task.creatorName,
    workerId: w.id, workerName: w.name, workerEmail: w.email, details: body.details, status: 'pending', createdAt: new Date().toISOString(),
  };
  db.submissions.push(sub);
  notify(task.creatorId, `${w.name} submitted work for “${task.title}”.`, '/dashboard/creator');
  save();
  res.status(201).json({ submission: sub });
}));

router.get('/mine', auth('worker'), wrap((req, res) => {
  res.json({ submissions: getDB().submissions.filter(s => s.workerId === req.user!.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
}));

// Creator: submissions to review across their tasks.
router.get('/to-review', auth('creator'), wrap((req, res) => {
  const status = typeof req.query.status === 'string' ? req.query.status : 'pending';
  res.json({ submissions: getDB().submissions.filter(s => s.creatorId === req.user!.id && (status === 'all' || s.status === status)).sort((a, b) => a.createdAt.localeCompare(b.createdAt)) });
}));

router.post('/:id/review', auth('creator'), wrap((req, res) => {
  const body = z.object({ decision: z.enum(['approved', 'rejected']), feedback: z.string().trim().max(300).optional() }).parse(req.body);
  if (body.decision === 'rejected' && !body.feedback) throw new HttpError(400, 'Tell the worker why the submission was rejected.');
  const db = getDB();
  const sub = db.submissions.find(s => s.id === req.params.id && s.creatorId === req.user!.id);
  if (!sub) throw new HttpError(404, 'Submission not found.');
  if (sub.status !== 'pending') throw new HttpError(409, 'This submission has already been reviewed.');
  sub.status = body.decision;
  sub.feedback = body.feedback || undefined;
  sub.reviewedAt = new Date().toISOString();
  const worker = db.users.find(u => u.id === sub.workerId);
  if (body.decision === 'approved') {
    if (worker) worker.coins += sub.payPerWorker; // coins were escrowed when the task was created
    notify(sub.workerId, `${req.user!.name} approved your submission for “${sub.taskTitle}”. You earned ${sub.payPerWorker} coins.`, '/dashboard/worker/submissions');
  } else {
    const task = db.tasks.find(t => t.id === sub.taskId);
    if (task) task.openSlots += 1; // slot goes back to the pool
    notify(sub.workerId, `Your submission for “${sub.taskTitle}” was rejected: ${body.feedback}`, '/dashboard/worker/submissions');
  }
  save();
  res.json({ submission: sub });
}));

export default router;
