export type Role = 'admin' | 'creator' | 'worker';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  coins: number;
  isBlocked: boolean;
  createdAt: string;
}

export const TASK_CATEGORIES = ['Social media', 'Survey', 'Data entry', 'Testing', 'Writing', 'Research', 'Design feedback'] as const;
export type TaskCategory = (typeof TASK_CATEGORIES)[number];

export interface Task {
  id: string;
  creatorId: string;
  creatorName: string;
  title: string;
  detail: string;
  category: TaskCategory;
  submissionInfo: string;
  totalWorkers: number;
  openSlots: number;
  payPerWorker: number;
  deadline: string;
  createdAt: string;
}

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';
export interface Submission {
  id: string;
  taskId: string;
  taskTitle: string;
  payPerWorker: number;
  creatorId: string;
  creatorName: string;
  workerId: string;
  workerName: string;
  workerEmail: string;
  details: string;
  status: SubmissionStatus;
  feedback?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface Payment { id: string; userId: string; userName: string; coins: number; amountUsd: number; reference: string; cardLast4: string; createdAt: string }

export const WALLETS = ['bKash', 'Nagad', 'Rocket'] as const;
export type Wallet = (typeof WALLETS)[number];
export interface Withdrawal {
  id: string; workerId: string; workerName: string; coins: number; amountUsd: number;
  wallet: Wallet; accountNumber: string; status: 'pending' | 'approved' | 'rejected'; createdAt: string; processedAt?: string;
}

export interface Notification { id: string; message: string; link?: string; read: boolean; createdAt: string }

export interface Rules {
  signupCoins: { worker: number; creator: number };
  coinsPerDollar: number;
  minWithdrawCoins: number;
  packages: { id: string; coins: number; price: number }[];
}
