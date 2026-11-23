import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, getToken, setToken } from './api';
import type { Role, User } from './types';

interface AuthState {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, role: 'worker' | 'creator') => Promise<User>;
  logout: () => void;
  setUser: (u: User) => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    if (!getToken()) return;
    try { setUser((await api<{ user: User }>('/auth/me')).user); } catch { setToken(null); setUser(null); }
  }, []);

  useEffect(() => { refresh().finally(() => setReady(true)); }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const r = await api<{ token: string; user: User }>('/auth/login', { method: 'POST', body: { email, password } });
    setToken(r.token); setUser(r.user); return r.user;
  }, []);
  const register = useCallback(async (name: string, email: string, password: string, role: 'worker' | 'creator') => {
    const r = await api<{ token: string; user: User }>('/auth/register', { method: 'POST', body: { name, email, password, role } });
    setToken(r.token); setUser(r.user); return r.user;
  }, []);
  const logout = useCallback(() => { setToken(null); setUser(null); }, []);

  const value = useMemo(() => ({ user, ready, login, register, logout, setUser, refresh }), [user, ready, login, register, logout, refresh]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export const homeFor = (role: Role) => `/dashboard/${role}`;

/** Demo accounts seeded by the API (see server/src/seed.ts). Local demo only. */
export const DEMO: Record<Role, { email: string; password: string; label: string }> = {
  worker: { email: 'worker@microtask.test', password: 'WorkerDemo#2026', label: 'Worker' },
  creator: { email: 'creator@microtask.test', password: 'CreatorDemo#2026', label: 'Task creator' },
  admin: { email: 'admin@microtask.test', password: 'AdminDemo#2026', label: 'Admin' },
};
