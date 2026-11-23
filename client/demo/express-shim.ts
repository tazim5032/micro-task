// Minimal Express-compatible router that runs in the browser, so the real API
// route files can power the static "live demo" build. Supports Router(), use(),
// get/post/patch/put/delete, :params, nested routers, async errors and 4-arg error handlers.
type Next = (err?: unknown) => void;
type Fn = (...args: any[]) => any;
interface Layer { method: string | null; path: string; prefix: boolean; handlers: (Fn | RouterImpl)[] }

export class RouterImpl {
  layers: Layer[] = [];
  use(a: string | Fn | RouterImpl, ...rest: (Fn | RouterImpl)[]) {
    if (typeof a === 'string') this.layers.push({ method: null, path: a, prefix: true, handlers: rest });
    else this.layers.push({ method: null, path: '', prefix: true, handlers: [a, ...rest] });
    return this;
  }
  private route(method: string, path: string, handlers: Fn[]) { this.layers.push({ method, path, prefix: false, handlers }); return this; }
  get(p: string, ...h: Fn[]) { return this.route('GET', p, h); }
  post(p: string, ...h: Fn[]) { return this.route('POST', p, h); }
  patch(p: string, ...h: Fn[]) { return this.route('PATCH', p, h); }
  put(p: string, ...h: Fn[]) { return this.route('PUT', p, h); }
  delete(p: string, ...h: Fn[]) { return this.route('DELETE', p, h); }
}

export function Router() { return new RouterImpl(); }
export default function express() { return new RouterImpl(); }
express.json = () => (_req: unknown, _res: unknown, next: Next) => next();
express.Router = Router;

function match(layer: Layer, path: string): { params: Record<string, string>; rest: string } | null {
  if (layer.prefix) {
    if (!layer.path) return { params: {}, rest: path };
    if (path === layer.path || path.startsWith(layer.path + '/')) return { params: {}, rest: path.slice(layer.path.length) || '/' };
    return null;
  }
  const a = layer.path.split('/').filter(Boolean);
  const b = path.split('/').filter(Boolean);
  if (a.length !== b.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith(':')) params[a[i].slice(1)] = decodeURIComponent(b[i]);
    else if (a[i] !== b[i]) return null;
  }
  return { params, rest: path };
}

export function handle(router: RouterImpl, req: any, res: any, out: Next) {
  let i = 0;
  const next: Next = err => {
    const layer = router.layers[i++];
    if (!layer) return out(err);
    const m = match(layer, req.path);
    if (!m || (layer.method && layer.method !== req.method)) return next(err);
    req.params = { ...req.params, ...m.params };
    let j = 0;
    const step: Next = e => {
      const h = layer.handlers[j++];
      if (!h) return next(e);
      if (h instanceof RouterImpl) {
        const saved = req.path;
        req.path = m.rest;
        return handle(h, req, res, e2 => { req.path = saved; step(e2); });
      }
      try {
        if (e !== undefined && e !== null) return h.length === 4 ? h(e, req, res, step) : step(e);
        if (h.length === 4) return step();
        const r = h(req, res, step);
        if (r && typeof r.catch === 'function') r.catch(step);
      } catch (x) { step(x); }
    };
    step(err);
  };
  next();
}

/** Run one request through the app and resolve with the JSON response. */
export function dispatchTo(app: RouterImpl, method: string, url: string, headers: Record<string, string>, body: unknown) {
  return new Promise<{ status: number; data: any }>(resolve => {
    const u = new URL(url, 'http://demo.local');
    const req = { method, path: u.pathname, url, headers, body: body ?? {}, query: Object.fromEntries(u.searchParams.entries()), params: {} };
    const res = {
      statusCode: 200,
      status(c: number) { this.statusCode = c; return this; },
      json(d: unknown) { resolve({ status: this.statusCode, data: JSON.parse(JSON.stringify(d ?? null)) }); return this; },
      send(d: unknown) { return this.json(d); },
    };
    handle(app, req, res, err => resolve({ status: 500, data: { message: err ? String((err as Error).message ?? err) : 'Not found' } }));
  });
}
