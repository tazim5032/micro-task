import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ZodError } from 'zod';
import { getDB, jwtSecret } from './db';
import type { PublicUser, Role, User } from './types';

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export interface AuthedRequest extends Request {
  user?: User;
}

type Handler = (req: AuthedRequest, res: Response, next: NextFunction) => unknown | Promise<unknown>;
export const wrap = (fn: Handler) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req as AuthedRequest, res, next)).catch(next);

export function publicUser(u: User): PublicUser {
  const { passwordHash: _omit, ...rest } = u;
  return rest;
}

export function signToken(u: User): string {
  return jwt.sign({ sub: u.id, role: u.role }, jwtSecret(), { expiresIn: '7d' });
}

export function auth(...roles: Role[]) {
  return wrap((req, _res, next) => {
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) throw new HttpError(401, 'Please log in to continue.');
    let payload: jwt.JwtPayload;
    try {
      payload = jwt.verify(token, jwtSecret()) as jwt.JwtPayload;
    } catch {
      throw new HttpError(401, 'Your session has expired. Please log in again.');
    }
    const user = getDB().users.find(u => u.id === payload.sub);
    if (!user) throw new HttpError(401, 'Account not found.');
    if (user.isBlocked) throw new HttpError(403, 'This account has been deactivated.');
    if (roles.length && !roles.includes(user.role)) throw new HttpError(403, 'You do not have access to this.');
    req.user = user;
    next();
  });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    const first = err.issues[0];
    return res.status(400).json({ message: first ? `${first.path.join('.') || 'input'}: ${first.message}` : 'Invalid input', issues: err.issues });
  }
  if (err instanceof HttpError) return res.status(err.status).json({ message: err.message });
  console.error(err);
  return res.status(500).json({ message: 'Something went wrong on our side.' });
}
