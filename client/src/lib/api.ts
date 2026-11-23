const TOKEN_KEY = 'mt_token';

export function getToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch { /* storage unavailable: session-only login */ }
}

export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

type Options = { method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'; body?: unknown; query?: Record<string, string | number | boolean | undefined | null> };

export async function api<T>(path: string, opts: Options = {}): Promise<T> {
  const qs = opts.query
    ? '?' + new URLSearchParams(Object.entries(opts.query).filter(([, v]) => v !== undefined && v !== null && v !== '').map(([k, v]) => [k, String(v)])).toString()
    : '';
  const token = getToken();
  if (import.meta.env.MODE === 'demo') {
    // @ts-ignore resolved by the Vite alias; only bundled in demo builds
    const { dispatch } = await import('@demo-server');
    const r = await dispatch(opts.method ?? 'GET', `/api${path}${qs === '?' ? '' : qs}`, token ? { authorization: `Bearer ${token}` } : {}, opts.body !== undefined ? JSON.parse(JSON.stringify(opts.body)) : undefined);
    if (r.status >= 400) throw new ApiError(r.data?.message ?? 'Request failed', r.status);
    return r.data as T;
  }
  const res = await fetch(`/api${path}${qs === '?' ? '' : qs}`, {
    method: opts.method ?? 'GET',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError((data as { message?: string }).message ?? 'Request failed. Is the API server running?', res.status);
  return data as T;
}

export const money = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
export const compactMoney = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(n);
export const date = (iso: string) => new Date(iso.length === 10 ? iso + 'T00:00:00' : iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
export const dateTime = (iso: string) => new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
export const shortId = (id: string) => id.slice(0, 8).toUpperCase();

export const IS_DEMO = import.meta.env.MODE === 'demo';
/** Live demo only: wipe this browser's demo data and reload with fresh sample data. */
export function resetDemoData() {
  try { localStorage.removeItem('mt_demo_db_v1'); localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
  location.href = '/';
}
