import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import type { DB, Payment, Submission, Task, User, Withdrawal } from './types';

// Demo accounts for local testing; the login page has one-click buttons for these.
export const DEMO_ACCOUNTS = {
  worker: { name: 'Tanvir Ahmed', email: 'worker@microtask.test', password: 'WorkerDemo#2026' },
  creator: { name: 'Nusrat Jahan', email: 'creator@microtask.test', password: 'CreatorDemo#2026' },
  admin: { name: 'Admin Demo', email: 'admin@microtask.test', password: 'AdminDemo#2026' },
};

const id = () => crypto.randomUUID();
const ago = (days: number, hours = 0) => new Date(Date.now() - days * 86400000 - hours * 3600000).toISOString();
const inDays = (days: number) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
const randomHash = () => bcrypt.hashSync(crypto.randomBytes(12).toString('hex'), 10);

export function buildSeed(): DB {
  const mk = (name: string, email: string, role: User['role'], coins: number, days: number, hash?: string): User =>
    ({ id: id(), name, email, passwordHash: hash ?? randomHash(), role, coins, isBlocked: false, createdAt: ago(days) });

  const admin = mk(DEMO_ACCOUNTS.admin.name, DEMO_ACCOUNTS.admin.email, 'admin', 0, 220, bcrypt.hashSync(DEMO_ACCOUNTS.admin.password, 10));
  const creator = mk(DEMO_ACCOUNTS.creator.name, DEMO_ACCOUNTS.creator.email, 'creator', 640, 150, bcrypt.hashSync(DEMO_ACCOUNTS.creator.password, 10));
  const creator2 = mk('Brightline Studio', 'studio@example.test', 'creator', 1210, 130);
  const worker = mk(DEMO_ACCOUNTS.worker.name, DEMO_ACCOUNTS.worker.email, 'worker', 245, 120, bcrypt.hashSync(DEMO_ACCOUNTS.worker.password, 10));
  const workers = [
    worker,
    mk('Farhana Akter', 'farhana@example.test', 'worker', 690, 110),
    mk('Rakib Hasan', 'rakib@example.test', 'worker', 520, 100),
    mk('Mitu Das', 'mitu@example.test', 'worker', 415, 90),
    mk('Arif Chowdhury', 'arif@example.test', 'worker', 330, 75),
    mk('Sumaiya Islam', 'sumaiya@example.test', 'worker', 180, 40),
  ];
  workers[5].isBlocked = true;

  const t = (c: User, title: string, category: Task['category'], detail: string, submissionInfo: string, total: number, open: number, pay: number, deadlineIn: number, created: number): Task =>
    ({ id: id(), creatorId: c.id, creatorName: c.name, title, category, detail, submissionInfo, totalWorkers: total, openSlots: open, payPerWorker: pay, deadline: inDays(deadlineIn), createdAt: ago(created) });

  const tasks: Task[] = [
    t(creator, 'Test our checkout flow on mobile', 'Testing', 'Place a test order on our demo store using your phone and report anything confusing, slow or broken.', 'Screen recording link plus a short list of issues found.', 12, 7, 30, 14, 9),
    t(creator, 'Answer a 5-minute survey about food delivery', 'Survey', 'Complete a short survey about how you order food online and what makes you choose an app.', 'The completion code shown at the end of the survey.', 40, 22, 8, 10, 6),
    t(creator2, 'Write a 150-word product description', 'Writing', 'Write an original, friendly description for a reusable water bottle. No AI-generated text.', 'Paste your description (plain text).', 10, 4, 45, 7, 5),
    t(creator2, 'Rate 20 landing page designs', 'Design feedback', 'Score 20 landing page screenshots from 1–5 for clarity and trust, with a one-line reason for each.', 'Link to a shared sheet with your ratings.', 15, 9, 25, 12, 4),
    t(creator, 'Follow and engage with our page', 'Social media', 'Follow our page, like the pinned post and leave a genuine comment about it.', 'Your profile username and a screenshot link.', 50, 31, 5, 20, 3),
    t(creator2, 'Collect contact info of 30 local cafés', 'Research', 'Find public business name, area and phone number of 30 cafés in Dhaka from public listings.', 'Link to a sheet with the 30 rows.', 8, 5, 60, 9, 3),
    t(creator, 'Transcribe a 3-minute audio clip', 'Data entry', 'Transcribe the provided English audio clip accurately, including speaker labels.', 'Paste the transcript.', 20, 13, 18, 8, 2),
    t(creator2, 'Find bugs in a signup form', 'Testing', 'Try unusual inputs on our signup form and report any validation bugs with steps to reproduce.', 'List of bugs with steps, expected and actual results.', 6, 3, 50, 5, 1),
    t(creator, 'Tag 100 product photos by category', 'Data entry', 'Assign one of 8 categories to each of 100 product photos in our labelling tool.', 'Your labelling tool username.', 25, 0, 15, 3, 18),
  ];

  const s = (task: Task, w: User, status: Submission['status'], days: number, details: string, feedback?: string): Submission => ({
    id: id(), taskId: task.id, taskTitle: task.title, payPerWorker: task.payPerWorker, creatorId: task.creatorId, creatorName: task.creatorName,
    workerId: w.id, workerName: w.name, workerEmail: w.email, details, status, feedback, createdAt: ago(days, 3), reviewedAt: status === 'pending' ? undefined : ago(Math.max(days - 1, 0)),
  });
  const submissions: Submission[] = [
    s(tasks[8], worker, 'approved', 16, 'Done. Username: tanvir_a'),
    s(tasks[1], worker, 'approved', 5, 'Completion code: FD-88213'),
    s(tasks[0], worker, 'pending', 1, 'Recording: https://example.test/rec/123 — the coupon field hides the pay button on small screens.'),
    s(tasks[4], worker, 'rejected', 2, 'Followed, username tanvir_a', 'Screenshot link was missing. Please resubmit with proof.'),
    s(tasks[6], worker, 'pending', 0, 'Speaker 1: Welcome to the show… (full transcript pasted)'),
    s(tasks[0], workers[1], 'pending', 1, 'Recording link: https://example.test/rec/456 — address form resets when you go back.'),
    s(tasks[1], workers[1], 'approved', 4, 'Completion code: FD-11902'),
    s(tasks[2], workers[2], 'pending', 2, 'Stay hydrated in style: this double-walled bottle keeps drinks cold for 24 hours…'),
    s(tasks[3], workers[3], 'approved', 3, 'Ratings sheet: https://example.test/sheet/abc'),
    s(tasks[7], workers[4], 'pending', 0, 'Bug 1: email with a plus sign is rejected. Steps: …'),
    s(tasks[5], workers[2], 'approved', 2, 'Sheet with 30 cafés: https://example.test/sheet/cafes'),
  ];

  const p = (u: User, coins: number, usd: number, days: number): Payment =>
    ({ id: id(), userId: u.id, userName: u.name, coins, amountUsd: usd, reference: 'pi_' + crypto.randomBytes(6).toString('hex'), cardLast4: '4242', createdAt: ago(days) });
  const payments: Payment[] = [p(creator, 500, 20, 140), p(creator, 150, 10, 60), p(creator2, 1000, 35, 125), p(creator2, 500, 20, 30), p(creator, 1000, 35, 8)];

  const w = (u: User, coins: number, wallet: Withdrawal['wallet'], status: Withdrawal['status'], days: number): Withdrawal =>
    ({ id: id(), workerId: u.id, workerName: u.name, coins, amountUsd: coins / 20, wallet, accountNumber: '01700000' + String(100 + days).slice(-3), status, createdAt: ago(days), processedAt: status === 'pending' ? undefined : ago(Math.max(days - 1, 0)) });
  const withdrawals: Withdrawal[] = [
    w(workers[1], 400, 'bKash', 'approved', 20), w(workers[2], 300, 'Nagad', 'approved', 12), w(worker, 200, 'bKash', 'approved', 9),
    w(workers[3], 260, 'Rocket', 'pending', 1), w(workers[1], 220, 'bKash', 'pending', 0),
  ];

  const notifications: DB['notifications'] = [
    { id: id(), userId: worker.id, message: `Nusrat Jahan approved your submission for “${tasks[1].title}”. You earned 8 coins.`, link: '/dashboard/worker/submissions', read: true, createdAt: ago(4) },
    { id: id(), userId: worker.id, message: `Your submission for “${tasks[4].title}” was rejected: Screenshot link was missing.`, link: '/dashboard/worker/submissions', read: false, createdAt: ago(1) },
    { id: id(), userId: worker.id, message: 'Your withdrawal of 200 coins ($10.00) to bKash was approved.', link: '/dashboard/worker/withdrawals', read: false, createdAt: ago(8) },
    { id: id(), userId: creator.id, message: `Tanvir Ahmed submitted work for “${tasks[6].title}”.`, link: '/dashboard/creator', read: false, createdAt: ago(0, 2) },
    { id: id(), userId: creator.id, message: `Farhana Akter submitted work for “${tasks[0].title}”.`, link: '/dashboard/creator', read: false, createdAt: ago(1) },
  ];

  return { users: [admin, creator, creator2, ...workers], tasks, submissions, payments, withdrawals, notifications };
}
