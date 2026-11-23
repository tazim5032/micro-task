import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { getDB, newId, notify, save } from '../db';
import { auth, HttpError, publicUser, signToken, wrap } from '../http';
import { RULES } from '../types';

const router = Router();

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(60),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  role: z.enum(['worker', 'creator']),
});

router.post('/register', wrap((req, res) => {
  const body = registerSchema.parse(req.body);
  const db = getDB();
  if (db.users.some(u => u.email === body.email)) throw new HttpError(409, 'An account with this email already exists.');
  const coins = RULES.signupCoins[body.role];
  const user = {
    id: newId(), name: body.name, email: body.email, passwordHash: bcrypt.hashSync(body.password, 10),
    role: body.role, coins, isBlocked: false, createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  notify(user.id, `Welcome to Micro Task! You received ${coins} free coins to get started.`, body.role === 'worker' ? '/tasks' : '/dashboard/creator/new');
  save();
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
}));

router.post('/login', wrap((req, res) => {
  const body = z.object({ email: z.string().trim().toLowerCase().email('Enter a valid email'), password: z.string().min(1, 'Enter your password') }).parse(req.body);
  const user = getDB().users.find(u => u.email === body.email);
  if (!user || !bcrypt.compareSync(body.password, user.passwordHash)) throw new HttpError(401, 'Incorrect email or password.');
  if (user.isBlocked) throw new HttpError(403, 'This account has been suspended. Please contact support.');
  res.json({ token: signToken(user), user: publicUser(user) });
}));

router.get('/me', auth(), wrap((req, res) => res.json({ user: publicUser(req.user!) })));

export default router;
