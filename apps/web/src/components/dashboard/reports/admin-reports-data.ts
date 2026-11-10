import {
  AlertTriangle,
  BarChart3,
  BedDouble,
  CircleDollarSign,
  ClipboardCheck,
  DoorOpen,
  FileSpreadsheet,
  GraduationCap,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

export type ReportCategory =
  | 'Admissions'
  | 'Occupancy'
  | 'Attendance'
  | 'Leave'
  | 'Visitors'
  | 'Complaints'
  | 'Staff'
  | 'Fees'
  | 'Safety';

export type ReportFormat = 'Chart + table' | 'Table' | 'Summary PDF';

export type ReportTemplate = {
  id: string;
  code: string;
  title: string;
  description: string;
  category: ReportCategory;
  frRef: string;
  format: ReportFormat;
  refresh: string;
  lastRun: string;
  hostelScoped: boolean;
  sparkline: number[];
};

export const REPORTS_STATS = {
  templates: 9,
  scheduledJobs: 6,
  exportsThisWeek: 24,
  avgRunSeconds: 4.2,
  dataFreshnessMin: 12,
} as const;

export const REPORT_CATEGORY_FILTERS = [
  'All Categories',
  'Admissions',
  'Occupancy',
  'Attendance',
  'Leave',
  'Visitors',
  'Complaints',
  'Staff',
  'Fees',
  'Safety',
] as const;

export const REPORT_PERIOD_FILTERS = ['Last 7 days', 'Last 30 days', 'This term', 'Custom range'] as const;

export const REPORT_HOSTEL_FILTERS = ['All Hostels', 'Boys Hostel A', 'Girls Hostel B', 'Graduate Block C'] as const;

export const CATEGORY_META: Record<ReportCategory, { icon: LucideIcon; accent: string }> = {
  Admissions: { icon: GraduationCap, accent: 'var(--nestora-sage)' },
  Occupancy: { icon: BedDouble, accent: 'var(--nestora-forest)' },
  Attendance: { icon: ClipboardCheck, accent: '#6d9773' },
  Leave: { icon: DoorOpen, accent: '#d97706' },
  Visitors: { icon: Users, accent: '#0284c7' },
  Complaints: { icon: Wrench, accent: '#78716c' },
  Staff: { icon: Users, accent: 'var(--nestora-tan)' },
  Fees: { icon: CircleDollarSign, accent: 'var(--nestora-gold)' },
  Safety: { icon: AlertTriangle, accent: '#dc2626' },
};

export const SAMPLE_REPORTS: ReportTemplate[] = [
  {
    id: 'rpt-fees',
    code: 'RPT-FEE-01',
    title: 'Fee collection & dues',
    description: 'Revenue assessed, collected, outstanding balances, and waivers by hostel and semester (FR-136).',
    category: 'Fees',
    frRef: 'FR-136',
    format: 'Chart + table',
    refresh: 'Hourly',
    lastRun: '2026-03-10T09:00:00Z',
    hostelScoped: false,
    sparkline: [62, 68, 71, 75, 82, 88],
  },
  {
    id: 'rpt-occupancy',
    code: 'RPT-OCC-01',
    title: 'Hostel occupancy & beds',
    description: 'Capacity utilization, vacant beds, and maintenance holds with drill-down (FR-130).',
    category: 'Occupancy',
    frRef: 'FR-130',
    format: 'Chart + table',
    refresh: 'Every 6h',
    lastRun: '2026-03-10T08:30:00Z',
    hostelScoped: true,
    sparkline: [88, 90, 91, 93, 94, 94],
  },
  {
    id: 'rpt-attendance',
    code: 'RPT-ATT-01',
    title: 'Attendance & movement',
    description: 'Daily attendance %, unexcused absences, and late returns (FR-131).',
    category: 'Attendance',
    frRef: 'FR-131',
    format: 'Chart + table',
    refresh: 'Daily',
    lastRun: '2026-03-10T07:00:00Z',
    hostelScoped: true,
    sparkline: [89, 90, 91, 92, 92, 93],
  },
  {
    id: 'rpt-complaints',
    code: 'RPT-CMP-01',
    title: 'Complaints & maintenance',
    description: 'Ticket volume by category, SLA turnaround, staff performance (FR-134).',
    category: 'Complaints',
    frRef: 'FR-134',
    format: 'Chart + table',
    refresh: 'Daily',
    lastRun: '2026-03-09T18:00:00Z',
    hostelScoped: true,
    sparkline: [12, 15, 11, 14, 10, 9],
  },
  {
    id: 'rpt-leave',
    code: 'RPT-LVE-01',
    title: 'Leave & outing history',
    description: 'Approved/rejected leave, overstays, and destination trends (FR-132).',
    category: 'Leave',
    frRef: 'FR-132',
    format: 'Table',
    refresh: 'Daily',
    lastRun: '2026-03-09T16:00:00Z',
    hostelScoped: true,
    sparkline: [22, 18, 25, 20, 24, 21],
  },
  {
    id: 'rpt-admissions',
    code: 'RPT-ADM-01',
    title: 'Admissions & demographics',
    description: 'Verified admissions, pending verification, gender-wise enrollment (FR-129).',
    category: 'Admissions',
    frRef: 'FR-129',
    format: 'Chart + table',
    refresh: 'Weekly',
    lastRun: '2026-03-08T12:00:00Z',
    hostelScoped: false,
    sparkline: [40, 55, 62, 70, 78, 85],
  },
  {
    id: 'rpt-visitors',
    code: 'RPT-VIS-01',
    title: 'Visitor activity',
    description: 'Check-ins, peak hours, hosts, and overstay records (FR-133).',
    category: 'Visitors',
    frRef: 'FR-133',
    format: 'Table',
    refresh: 'Daily',
    lastRun: '2026-03-10T06:00:00Z',
    hostelScoped: true,
    sparkline: [8, 12, 9, 14, 11, 10],
  },
  {
    id: 'rpt-staff',
    code: 'RPT-STF-01',
    title: 'Staff attendance & tasks',
    description: 'Shift records and closed maintenance orders per worker (FR-135).',
    category: 'Staff',
    frRef: 'FR-135',
    format: 'Table',
    refresh: 'Weekly',
    lastRun: '2026-03-07T09:00:00Z',
    hostelScoped: true,
    sparkline: [95, 94, 96, 93, 97, 96],
  },
  {
    id: 'rpt-safety',
    code: 'RPT-EMG-01',
    title: 'Emergency incident summary',
    description: 'Incident categories, response timelines, and escalations (FR-138).',
    category: 'Safety',
    frRef: 'FR-138',
    format: 'Summary PDF',
    refresh: 'On demand',
    lastRun: '2026-03-01T10:00:00Z',
    hostelScoped: false,
    sparkline: [2, 1, 0, 1, 0, 0],
  },
];

export function getReportById(id: string): ReportTemplate | undefined {
  return SAMPLE_REPORTS.find((r) => r.id === id);
}

export function formatReportWhen(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
}

export function formatInr(value: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

export const FEE_CHART_DATA = [
  { month: 'Oct', collected: 410000, outstanding: 95000 },
  { month: 'Nov', collected: 445000, outstanding: 82000 },
  { month: 'Dec', collected: 460000, outstanding: 78000 },
  { month: 'Jan', collected: 472000, outstanding: 76000 },
  { month: 'Feb', collected: 478000, outstanding: 75000 },
  { month: 'Mar', collected: 485000, outstanding: 75000 },
];

export const OCCUPANCY_CHART_DATA = [
  { hostel: 'Boys A', occupied: 94, vacant: 6 },
  { hostel: 'Girls B', occupied: 96, vacant: 4 },
  { hostel: 'Grad C', occupied: 91, vacant: 9 },
];

export const ATTENDANCE_CHART_DATA = [
  { week: 'W1', rate: 90.2 },
  { week: 'W2', rate: 91.0 },
  { week: 'W3', rate: 91.8 },
  { week: 'W4', rate: 92.4 },
];

export const COMPLAINTS_CHART_DATA = [
  { category: 'Electrical', open: 4, resolved: 12 },
  { category: 'Plumbing', open: 3, resolved: 9 },
  { category: 'Cleaning', open: 2, resolved: 8 },
  { category: 'Civil', open: 2, resolved: 5 },
];

export type ReportTableRow = Record<string, string | number>;

export const SAMPLE_TABLE_ROWS: Record<string, ReportTableRow[]> = {
  'rpt-fees': [
    { hostel: 'Boys Hostel A', assessed: 1840000, collected: 1720000, outstanding: 120000 },
    { hostel: 'Girls Hostel B', assessed: 1560000, collected: 1480000, outstanding: 80000 },
    { hostel: 'Graduate Block C', assessed: 980000, collected: 910000, outstanding: 70000 },
  ],
  'rpt-occupancy': [
    { block: 'Block A', beds: 220, occupied: 207, vacant: 13 },
    { block: 'Block B', beds: 180, occupied: 169, vacant: 11 },
    { block: 'Block G', beds: 160, occupied: 154, vacant: 6 },
  ],
  'rpt-attendance': [
    { date: '2026-03-08', present: 412, absent: 28, onLeave: 38 },
    { date: '2026-03-09', present: 418, absent: 24, onLeave: 36 },
    { date: '2026-03-10', present: 416, absent: 34, onLeave: 38 },
  ],
  'rpt-complaints': [
    { category: 'Electrical', submitted: 18, resolved: 14, avgHours: 22 },
    { category: 'Plumbing', submitted: 12, resolved: 10, avgHours: 26 },
  ],
};

export const DEFAULT_PREVIEW_ID = 'rpt-fees';
