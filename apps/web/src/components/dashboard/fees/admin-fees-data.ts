import type { LucideIcon } from 'lucide-react';
import { CalendarClock, CircleDollarSign, FileCheck, Receipt, Wallet } from 'lucide-react';

export type FeeAccountStatus = 'Current' | 'Due soon' | 'Overdue' | 'Cleared';

export type LedgerAccount = {
  id: string;
  code: string;
  studentName: string;
  regNo: string;
  hostel: string;
  room: string;
  semester: string;
  assessed: number;
  paid: number;
  outstanding: number;
  status: FeeAccountStatus;
  lastPayment: string | null;
  frRef: string;
  sparkline: number[];
};

export type FeeSchedule = {
  id: string;
  title: string;
  semester: string;
  status: 'Active' | 'Pending approval' | 'Draft';
  roomTypes: string;
  effectiveFrom: string;
};

export const FEES_STATS = {
  collectedMonth: 4850000,
  outstandingTotal: 892000,
  pendingApprovals: 4,
  activeSchedules: 3,
  remindersQueued: 28,
} as const;

export const FEE_STATUS_FILTERS = ['All status', 'Current', 'Due soon', 'Overdue', 'Cleared'] as const;
export const FEE_HOSTEL_FILTERS = ['All hostels', 'Boys Hostel A', 'Girls Hostel B', 'Graduate Block C'] as const;

export const STATUS_META: Record<FeeAccountStatus, { accent: string }> = {
  Current: { accent: 'var(--nestora-sage)' },
  'Due soon': { accent: 'var(--nestora-gold)' },
  Overdue: { accent: '#dc2626' },
  Cleared: { accent: 'var(--nestora-forest)' },
};

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  schedule: CalendarClock,
  ledger: Wallet,
  receipt: Receipt,
  approval: FileCheck,
};

export const SAMPLE_SCHEDULES: FeeSchedule[] = [
  { id: 'sched-2025-q2', title: 'Q2 hostel charges', semester: '2025–26 Q2', status: 'Active', roomTypes: 'All 6 configs', effectiveFrom: '2025-10-01' },
  { id: 'sched-deposit', title: 'Caution deposit', semester: '2025–26', status: 'Active', roomTypes: 'Universal', effectiveFrom: '2025-08-01' },
  { id: 'sched-2026-q1', title: 'Q1 draft schedule', semester: '2026–27 Q1', status: 'Pending approval', roomTypes: 'Single & Double AC', effectiveFrom: '2026-01-01' },
];

export const SAMPLE_LEDGER_ACCOUNTS: LedgerAccount[] = [
  {
    id: 'led-stu-8821',
    code: 'FEE-1001',
    studentName: 'Ananya Sharma',
    regNo: 'NSU/24/8821',
    hostel: 'Girls Hostel B',
    room: 'B-204',
    semester: '2025–26 Q2',
    assessed: 48500,
    paid: 36000,
    outstanding: 12500,
    status: 'Due soon',
    lastPayment: '2025-10-28T10:00:00.000Z',
    frRef: 'FR-077',
    sparkline: [8, 9, 8, 10, 9, 11, 10],
  },
  {
    id: 'led-stu-4410',
    code: 'FEE-1002',
    studentName: 'Rahul Verma',
    regNo: 'NSU/24/4410',
    hostel: 'Boys Hostel A',
    room: 'A-118',
    semester: '2025–26 Q2',
    assessed: 52000,
    paid: 52000,
    outstanding: 0,
    status: 'Cleared',
    lastPayment: '2025-11-05T14:30:00.000Z',
    frRef: 'FR-083',
    sparkline: [5, 6, 7, 7, 8, 8, 9],
  },
  {
    id: 'led-stu-3312',
    code: 'FEE-1003',
    studentName: 'Priya Nair',
    regNo: 'NSU/23/3312',
    hostel: 'Graduate Block C',
    room: 'C-402',
    semester: '2025–26 Q2',
    assessed: 61200,
    paid: 40000,
    outstanding: 21200,
    status: 'Overdue',
    lastPayment: '2025-09-12T09:00:00.000Z',
    frRef: 'FR-078',
    sparkline: [6, 7, 8, 9, 10, 11, 12],
  },
  {
    id: 'led-stu-9901',
    code: 'FEE-1004',
    studentName: 'Vikram Singh',
    regNo: 'NSU/24/9901',
    hostel: 'Boys Hostel A',
    room: 'A-305',
    semester: '2025–26 Q2',
    assessed: 49800,
    paid: 45000,
    outstanding: 4800,
    status: 'Current',
    lastPayment: '2025-11-08T16:00:00.000Z',
    frRef: 'FR-077',
    sparkline: [4, 5, 4, 5, 5, 6, 5],
  },
  {
    id: 'led-stu-7720',
    code: 'FEE-1005',
    studentName: 'Meera Joshi',
    regNo: 'NSU/24/7720',
    hostel: 'Girls Hostel B',
    room: 'B-112',
    semester: '2025–26 Q2',
    assessed: 47500,
    paid: 30000,
    outstanding: 17500,
    status: 'Due soon',
    lastPayment: '2025-10-15T11:00:00.000Z',
    frRef: 'FR-081',
    sparkline: [7, 7, 8, 8, 9, 9, 10],
  },
  {
    id: 'led-stu-6654',
    code: 'FEE-1006',
    studentName: 'Arjun Patel',
    regNo: 'NSU/23/6654',
    hostel: 'Boys Hostel A',
    room: 'A-210',
    semester: '2025–26 Q2',
    assessed: 54000,
    paid: 54000,
    outstanding: 0,
    status: 'Cleared',
    lastPayment: '2025-11-01T08:00:00.000Z',
    frRef: 'FR-076',
    sparkline: [3, 4, 4, 5, 5, 5, 6],
  },
];

export const DEFAULT_LEDGER_ID = 'led-stu-8821';

export const COLLECTION_CHART_DATA = [
  { month: 'Jun', collected: 320000, outstanding: 980000 },
  { month: 'Jul', collected: 355000, outstanding: 920000 },
  { month: 'Aug', collected: 390000, outstanding: 880000 },
  { month: 'Sep', collected: 410000, outstanding: 910000 },
  { month: 'Oct', collected: 445000, outstanding: 892000 },
  { month: 'Nov', collected: 485000, outstanding: 850000 },
];

export type LedgerLine = {
  label: string;
  type: 'Charge' | 'Payment' | 'Waiver' | 'Late fee';
  amount: number;
  date: string;
  ref?: string;
};

export const LEDGER_LINES: Record<string, LedgerLine[]> = {
  'led-stu-8821': [
    { label: 'Q2 room rent — Double AC', type: 'Charge', amount: 42000, date: '2025-10-01' },
    { label: 'Amenities & mess', type: 'Charge', amount: 6500, date: '2025-10-01' },
    { label: 'NEFT · CHN882190', type: 'Payment', amount: -36000, date: '2025-10-28', ref: 'FR-076' },
  ],
  'led-stu-3312': [
    { label: 'Q2 room rent — Triple', type: 'Charge', amount: 38000, date: '2025-10-01' },
    { label: 'Late fee (grace exceeded)', type: 'Late fee', amount: 1200, date: '2025-10-15', ref: 'FR-078' },
    { label: 'Amenities', type: 'Charge', amount: 6200, date: '2025-10-01' },
    { label: 'DD · DEP331200', type: 'Payment', amount: -40000, date: '2025-09-12', ref: 'FR-076' },
  ],
};

export const PENDING_WAIVERS = [
  { id: 'wvr-1', student: 'Priya Nair', amount: 5000, reason: 'Medical concession', status: 'Pending', frRef: 'FR-080' },
  { id: 'wvr-2', student: 'Ananya Sharma', amount: 2000, reason: 'Sibling discount', status: 'Pending', frRef: 'FR-079' },
];

export function getLedgerById(id: string): LedgerAccount | undefined {
  return SAMPLE_LEDGER_ACCOUNTS.find((a) => a.id === id);
}

export function formatInr(value: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

export function formatFeeWhen(iso: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
}
