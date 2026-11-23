// Live demo entry: runs the real API routes in the browser (see vite.config.ts aliases).
import { Router, dispatchTo } from './express-shim';
import { errorHandler, HttpError } from '../../server/src/http';
import { loadDB, resetDB, DEMO_DB_KEY } from './db';
import authRoutes from '../../server/src/routes/auth';
import tasksRoutes from '../../server/src/routes/tasks';
import submissionsRoutes from '../../server/src/routes/submissions';
import adminRoutes from '../../server/src/routes/admin';
import walletRoutes from '../../server/src/routes/wallet';

const app = Router();
app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', walletRoutes);
app.use('/api', (_req: unknown, _res: unknown, next: (e?: unknown) => void) => next(new HttpError(404, 'Endpoint not found.')));
app.use(errorHandler);

export function dispatch(method: string, url: string, headers: Record<string, string>, body: unknown) {
  loadDB();
  return dispatchTo(app, method, url, headers, body);
}
export { resetDB, DEMO_DB_KEY };
