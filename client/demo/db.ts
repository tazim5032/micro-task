// Browser version of server/src/db.ts for the live demo build: same exports,
// data kept in this visitor's localStorage and seeded from the real seed file.
import { buildSeed } from '../../server/src/seed';

export const DEMO_DB_KEY = 'mt_demo_db_v1';
let db: any = null;

export function loadDB() {
  if (db) return db;
  try { const raw = localStorage.getItem(DEMO_DB_KEY); if (raw) db = JSON.parse(raw); } catch { db = null; }
  if (!db) { db = buildSeed(); save(); }
  return db;
}
export const getDB = () => loadDB();
export function save() { try { localStorage.setItem(DEMO_DB_KEY, JSON.stringify(db)); } catch { /* storage full or blocked: keep in memory */ } }
export function resetDB() { db = buildSeed(); save(); }
export const jwtSecret = () => 'demo';
export const newId = () => globalThis.crypto.randomUUID();
export const DATA_DIR = '';
export function notify(userId: string, message: string, link?: string) {
  getDB().notifications.push({ id: newId(), userId, message, link, read: false, createdAt: new Date().toISOString() });
}
