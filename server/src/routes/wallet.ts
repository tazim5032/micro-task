// Coins in (simulated card checkout for creators) and coins out (withdrawals for workers).
import { Router } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { getDB, newId, notify, save } from '../db';
import { auth, HttpError, publicUser, wrap } from '../http';
import { RULES, WALLETS, type Payment, type Withdrawal } from '../types';

const router = Router();

router.get('/config', (_req, res) => res.json(RULES));

// Simulated Stripe test-mode checkout: accepts the documented test card number only.
router.post('/purchase', auth('creator'), wrap((req, res) => {
  const body = z.object({
    packageId: z.string(),
    cardNumber: z.string().transform(s => s.replace(/\s+/g, '')),
    outcome: z.enum(['success', 'declined']).default('success'),
  }).parse(req.body);
  const pkg = RULES.packages.find(p => p.id === body.packageId);
  if (!pkg) throw new HttpError(400, 'Unknown coin package.');
  if (body.cardNumber !== '4242424242424242') throw new HttpError(400, 'Sandbox mode: use the test card 4242 4242 4242 4242.');
  if (body.outcome === 'declined') throw new HttpError(402, 'Your card was declined (simulated). No coins were added.');
  const user = req.user!;
  user.coins += pkg.coins;
  const payment: Payment = {
    id: newId(), userId: user.id, userName: user.name, coins: pkg.coins, amountUsd: pkg.price,
    reference: 'pi_' + crypto.randomBytes(6).toString('hex'), cardLast4: body.cardNumber.slice(-4), createdAt: new Date().toISOString(),
  };
  getDB().payments.push(payment);
  notify(user.id, `Payment of $${pkg.price} received. ${pkg.coins} coins were added to your balance.`, '/dashboard/creator/payments');
  save();
  res.status(201).json({ payment, user: publicUser(user) });
}));

router.get('/payments', auth('creator'), wrap((req, res) => {
  res.json({ payments: getDB().payments.filter(p => p.userId === req.user!.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
}));

// Worker requests a withdrawal; coins are held until an admin approves or rejects.
router.post('/withdrawals', auth('worker'), wrap((req, res) => {
  const body = z.object({
    coins: z.coerce.number().int().min(RULES.minWithdrawCoins, `Minimum withdrawal is ${RULES.minWithdrawCoins} coins`),
    wallet: z.enum(WALLETS),
    accountNumber: z.string().trim().regex(/^01\d{9}$/, 'Enter an 11-digit mobile wallet number starting with 01'),
  }).parse(req.body);
  const user = req.user!;
  if (body.coins > user.coins) throw new HttpError(400, `You only have ${user.coins} coins.`);
  user.coins -= body.coins;
  const w: Withdrawal = {
    id: newId(), workerId: user.id, workerName: user.name, coins: body.coins, amountUsd: body.coins / RULES.coinsPerDollar,
    wallet: body.wallet, accountNumber: body.accountNumber, status: 'pending', createdAt: new Date().toISOString(),
  };
  getDB().withdrawals.push(w);
  save();
  res.status(201).json({ withdrawal: w, user: publicUser(user) });
}));

router.get('/withdrawals', auth('worker'), wrap((req, res) => {
  res.json({ withdrawals: getDB().withdrawals.filter(w => w.workerId === req.user!.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
}));

// Notifications for any signed-in user.
router.get('/notifications', auth(), wrap((req, res) => {
  const list = getDB().notifications.filter(n => n.userId === req.user!.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 30);
  res.json({ notifications: list, unread: list.filter(n => !n.read).length });
}));

router.post('/notifications/read', auth(), wrap((req, res) => {
  getDB().notifications.filter(n => n.userId === req.user!.id).forEach(n => { n.read = true; });
  save();
  res.json({ ok: true });
}));

export { notify };
export default router;
