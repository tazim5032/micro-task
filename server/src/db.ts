// JSON-file database in server/data/db.json, written atomically after each change.
// Routes only use getDB(), save() and notify(); swap this module for MongoDB later.
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { DB } from './types';
import { buildSeed } from './seed';

export const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const SECRET_FILE = path.join(DATA_DIR, 'jwt-secret.txt');

let db: DB;

export function loadDB(): DB {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (fs.existsSync(DB_FILE)) db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) as DB;
  else { db = buildSeed(); save(); console.log('Seeded a fresh database at', DB_FILE); }
  return db;
}

export function getDB(): DB {
  if (!db) throw new Error('Database not loaded');
  return db;
}

export function save(): void {
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

export function resetDB(): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  db = buildSeed();
  save();
}

export function jwtSecret(): string {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(SECRET_FILE)) fs.writeFileSync(SECRET_FILE, crypto.randomBytes(48).toString('hex'));
  return fs.readFileSync(SECRET_FILE, 'utf8').trim();
}

export const newId = () => crypto.randomUUID();

export function notify(userId: string, message: string, link?: string) {
  getDB().notifications.push({ id: newId(), userId, message, link, read: false, createdAt: new Date().toISOString() });
}
