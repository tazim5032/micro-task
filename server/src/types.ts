export type Role = 'admin' | 'creator' | 'worker';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
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
  /** Open slots still available to workers (pending submissions hold a slot). */
  openSlots: number;
  payPerWorker: number;
  deadline: string; // YYYY-MM-DD
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

export interface Payment {
  id: string;
  userId: string;
  userName: string;
  coins: number;
  amountUsd: number;
  reference: string;
  cardLast4: string;
  createdAt: string;
}

export const WALLETS = ['bKash', 'Nagad', 'Rocket'] as const;
export type Wallet = (typeof WALLETS)[number];
export type WithdrawalStatus = 'pending' | 'approved' | 'rejected';

export interface Withdrawal {
  id: string;
  workerId: string;
  workerName: string;
  coins: number;
  amountUsd: number;
  wallet: Wallet;
  accountNumber: string;
  status: WithdrawalStatus;
  createdAt: string;
  processedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface DB {
  users: User[];
  tasks: Task[];
  submissions: Submission[];
  payments: Payment[];
  withdrawals: Withdrawal[];
  notifications: Notification[];
}

export type PublicUser = Omit<User, 'passwordHash'>;

/** Business rules, shared with the client via GET /api/config. */
export const RULES = {
  signupCoins: { worker: 10, creator: 50 },
  coinsPerDollar: 20, // withdrawals: 20 coins = $1
  minWithdrawCoins: 200,
  packages: [
    { id: 'p10', coins: 10, price: 1 },
    { id: 'p150', coins: 150, price: 10 },
    { id: 'p500', coins: 500, price: 20 },
    { id: 'p1000', coins: 1000, price: 35 },
  ],
};
