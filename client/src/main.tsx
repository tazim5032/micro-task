import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './index.css';
import { AuthProvider, homeFor, useAuth } from './lib/auth';
import { ToastProvider } from './lib/toast';
import { SiteLayout } from './components/Layout';
import { DashboardLayout, RequireAuth } from './components/DashboardLayout';
import { Spinner } from './components/ui';
import { Home, HowItWorks, NotFound, TaskDetails, Tasks } from './pages/Public';
import { Login, Register } from './pages/Auth';
import { WorkerOverview, WorkerSubmissions, WorkerWithdrawals } from './pages/dashboard/Worker';
import { BuyCoins, CreatorOverview, MyTasks, NewTask, Payments } from './pages/dashboard/Creator';
import { AdminOverview, AdminTasks, AdminUsers, AdminWithdrawals } from './pages/dashboard/Admin';

function DashboardHome() {
  const { user, ready } = useAuth();
  if (!ready) return <Spinner />;
  return user ? <Navigate to={homeFor(user.role)} replace /> : <Navigate to="/login" replace />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route element={<SiteLayout />}>
              <Route index element={<Home />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="tasks/:id" element={<TaskDetails />} />
              <Route path="how-it-works" element={<HowItWorks />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="dashboard/worker" element={<RequireAuth role="worker"><DashboardLayout role="worker" /></RequireAuth>}>
              <Route index element={<WorkerOverview />} />
              <Route path="submissions" element={<WorkerSubmissions />} />
              <Route path="withdrawals" element={<WorkerWithdrawals />} />
            </Route>
            <Route path="dashboard/creator" element={<RequireAuth role="creator"><DashboardLayout role="creator" /></RequireAuth>}>
              <Route index element={<CreatorOverview />} />
              <Route path="new" element={<NewTask />} />
              <Route path="tasks" element={<MyTasks />} />
              <Route path="coins" element={<BuyCoins />} />
              <Route path="payments" element={<Payments />} />
            </Route>
            <Route path="dashboard/admin" element={<RequireAuth role="admin"><DashboardLayout role="admin" /></RequireAuth>}>
              <Route index element={<AdminOverview />} />
              <Route path="withdrawals" element={<AdminWithdrawals />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="tasks" element={<AdminTasks />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
