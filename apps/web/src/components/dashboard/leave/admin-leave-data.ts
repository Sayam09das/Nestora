export type LeaveStatus =
  | 'Pending Review'
  | 'Approved'
  | 'On Leave'
  | 'Returned'
  | 'Rejected'
  | 'Extension Pending'
  | 'Overstayed';

export type LeaveCategory = 'Medical' | 'Family' | 'Academic' | 'Emergency' | 'Personal';

export type LeaveRecord = {
  id: string;
  leaveRef: string;
  studentId: string;
  studentName: string;
  hostel: string;
  block: string;
  roomBed: string;
  category: LeaveCategory;
  destination: string;
  reason: string;
  emergencyContact: string;
  departureDate: string;
  expectedReturnDate: string;
  status: LeaveStatus;
  submittedAt: string;
  reviewedBy: string | null;
  gatePassToken: string | null;
  bedRetained: boolean;
  hasExtension: boolean;
  lateReturn: boolean;
};

export type LeaveTimelineEntry = {
  id: string;
  leaveId: string;
  action: string;
  actor: string;
  notes: string | null;
  at: string;
};

export const LEAVE_STATS = {
  pendingReview: 4,
  onLeaveNow: 38,
  returningToday: 6,
  extensionsPending: 2,
  overstayed: 1,
  approvedThisWeek: 22,
} as const;

export const LEAVE_HOSTEL_FILTERS = ['All Hostels', 'Boys Hostel A', 'Girls Hostel B', 'Graduate Block C'] as const;
export const LEAVE_CATEGORY_FILTERS = ['All Categories', 'Medical', 'Family', 'Academic', 'Emergency', 'Personal'] as const;
export const LEAVE_STATUS_FILTERS = [
  'All Status',
  'Pending Review',
  'Approved',
  'On Leave',
  'Returned',
  'Rejected',
  'Extension Pending',
  'Overstayed',
] as const;

export const LEAVE_QUEUE_STATUSES: LeaveStatus[] = [
  'Pending Review',
  'Extension Pending',
  'Approved',
  'Overstayed',
];

export const SAMPLE_LEAVES: LeaveRecord[] = [
  {
    id: 'lv1',
    leaveRef: 'LV-2026-0412',
    studentId: 'STU-10482',
    studentName: 'Arjun Mehta',
    hostel: 'Boys Hostel A',
    block: 'Block B',
    roomBed: 'B-312 · Bed A',
    category: 'Family',
    destination: 'Pune, Maharashtra',
    reason: 'Sister’s wedding; family expects arrival two days before ceremony.',
    emergencyContact: '+91 98765 43210',
    departureDate: '2026-03-12',
    expectedReturnDate: '2026-03-17',
    status: 'Pending Review',
    submittedAt: '2026-03-10T08:15:00Z',
    reviewedBy: null,
    gatePassToken: null,
    bedRetained: true,
    hasExtension: false,
    lateReturn: false,
  },
  {
    id: 'lv2',
    leaveRef: 'LV-2026-0398',
    studentId: 'STU-09112',
    studentName: 'Priya Nair',
    hostel: 'Girls Hostel B',
    block: 'Block G',
    roomBed: 'G-204 · Bed B',
    category: 'Medical',
    destination: 'City Hospital, Kochi',
    reason: 'Follow-up appointment with specialist; guardian accompanying.',
    emergencyContact: '+91 98112 22004',
    departureDate: '2026-03-11',
    expectedReturnDate: '2026-03-12',
    status: 'Approved',
    submittedAt: '2026-03-09T14:00:00Z',
    reviewedBy: 'Warden · Girls B',
    gatePassToken: 'GP-8F2A91',
    bedRetained: true,
    hasExtension: false,
    lateReturn: false,
  },
  {
    id: 'lv3',
    leaveRef: 'LV-2026-0381',
    studentId: 'STU-11003',
    studentName: 'Daniel Wu',
    hostel: 'Graduate Block C',
    block: 'Block C',
    roomBed: 'C-118 · Bed A',
    category: 'Academic',
    destination: 'IIT Delhi (conference)',
    reason: 'Presenting research poster; faculty sponsor letter attached.',
    emergencyContact: '+91 99001 88431',
    departureDate: '2026-03-08',
    expectedReturnDate: '2026-03-10',
    status: 'On Leave',
    submittedAt: '2026-03-06T11:30:00Z',
    reviewedBy: 'Warden · Graduate C',
    gatePassToken: 'GP-3C9910',
    bedRetained: true,
    hasExtension: false,
    lateReturn: false,
  },
  {
    id: 'lv4',
    leaveRef: 'LV-2026-0370',
    studentId: 'STU-10241',
    studentName: 'Rohan Das',
    hostel: 'Boys Hostel A',
    block: 'Block A',
    roomBed: 'A-215 · Bed B',
    category: 'Personal',
    destination: 'Kolkata',
    reason: 'Weekend home visit; parents’ anniversary.',
    emergencyContact: '+91 94320 11876',
    departureDate: '2026-03-07',
    expectedReturnDate: '2026-03-09',
    status: 'Returned',
    submittedAt: '2026-03-05T09:00:00Z',
    reviewedBy: 'Warden · Block A',
    gatePassToken: 'GP-7712BD',
    bedRetained: true,
    hasExtension: false,
    lateReturn: false,
  },
  {
    id: 'lv5',
    leaveRef: 'LV-2026-0405',
    studentId: 'STU-08877',
    studentName: 'Meera Shah',
    hostel: 'Girls Hostel B',
    block: 'Block G',
    roomBed: 'G-401 · Bed A',
    category: 'Emergency',
    destination: 'Ahmedabad',
    reason: 'Urgent family matter; guardian call logged at desk.',
    emergencyContact: '+91 98250 66771',
    departureDate: '2026-03-10',
    expectedReturnDate: '2026-03-13',
    status: 'Pending Review',
    submittedAt: '2026-03-10T06:45:00Z',
    reviewedBy: null,
    gatePassToken: null,
    bedRetained: true,
    hasExtension: false,
    lateReturn: false,
  },
  {
    id: 'lv6',
    leaveRef: 'LV-2026-0362',
    studentId: 'STU-10655',
    studentName: 'Vikram Joshi',
    hostel: 'Boys Hostel A',
    block: 'Block B',
    roomBed: 'B-108 · Bed A',
    category: 'Medical',
    destination: 'On-campus clinic → home rest',
    reason: 'Post-surgery recovery; doctor advised 5 days off campus.',
    emergencyContact: '+91 98760 55432',
    departureDate: '2026-03-04',
    expectedReturnDate: '2026-03-09',
    status: 'Overstayed',
    submittedAt: '2026-03-03T16:20:00Z',
    reviewedBy: 'Warden · Block B',
    gatePassToken: 'GP-22AA90',
    bedRetained: true,
    hasExtension: true,
    lateReturn: true,
  },
  {
    id: 'lv7',
    leaveRef: 'LV-2026-0390',
    studentId: 'STU-10333',
    studentName: 'Neil Kapoor',
    hostel: 'Boys Hostel A',
    block: 'Block B',
    roomBed: 'B-215 · Bed A',
    category: 'Family',
    destination: 'Jaipur',
    reason: 'Sibling graduation ceremony.',
    emergencyContact: '+91 99887 11223',
    departureDate: '2026-03-14',
    expectedReturnDate: '2026-03-16',
    status: 'Pending Review',
    submittedAt: '2026-03-10T10:05:00Z',
    reviewedBy: null,
    gatePassToken: null,
    bedRetained: true,
    hasExtension: false,
    lateReturn: false,
  },
  {
    id: 'lv8',
    leaveRef: 'LV-2026-0355',
    studentId: 'STU-10901',
    studentName: 'Sara Okonkwo',
    hostel: 'Graduate Block C',
    block: 'Block C',
    roomBed: 'C-220 · Bed B',
    category: 'Academic',
    destination: 'Hyderabad (internship interview)',
    reason: 'Panel interview with 24h travel buffer.',
    emergencyContact: '+91 99009 44321',
    departureDate: '2026-03-09',
    expectedReturnDate: '2026-03-11',
    status: 'Extension Pending',
    submittedAt: '2026-03-08T07:30:00Z',
    reviewedBy: 'Warden · Graduate C',
    gatePassToken: 'GP-88CC01',
    bedRetained: true,
    hasExtension: true,
    lateReturn: false,
  },
  {
    id: 'lv9',
    leaveRef: 'LV-2026-0344',
    studentId: 'STU-09220',
    studentName: 'Ananya Krishnan',
    hostel: 'Girls Hostel B',
    block: 'Block G',
    roomBed: 'G-208 · Bed A',
    category: 'Personal',
    destination: 'Chennai',
    reason: 'Rejected: dates overlap with mid-term week without academic clearance.',
    emergencyContact: '+91 98400 55667',
    departureDate: '2026-03-15',
    expectedReturnDate: '2026-03-18',
    status: 'Rejected',
    submittedAt: '2026-03-07T12:00:00Z',
    reviewedBy: 'Warden · Girls B',
    gatePassToken: null,
    bedRetained: true,
    hasExtension: false,
    lateReturn: false,
  },
  {
    id: 'lv10',
    leaveRef: 'LV-2026-0408',
    studentId: 'STU-10590',
    studentName: 'Ishaan Roy',
    hostel: 'Boys Hostel A',
    block: 'Block B',
    roomBed: 'B-318 · Bed B',
    category: 'Family',
    destination: 'Lucknow',
    reason: 'Long weekend with parents; train tickets booked.',
    emergencyContact: '+91 98111 90909',
    departureDate: '2026-03-13',
    expectedReturnDate: '2026-03-15',
    status: 'Pending Review',
    submittedAt: '2026-03-10T11:20:00Z',
    reviewedBy: null,
    gatePassToken: null,
    bedRetained: true,
    hasExtension: false,
    lateReturn: false,
  },
];

export const SAMPLE_LEAVE_TIMELINE: LeaveTimelineEntry[] = [
  { id: 'lt1', leaveId: 'lv1', action: 'Submitted', actor: 'Arjun Mehta', notes: 'FR-038 leave form complete.', at: '2026-03-10T08:15:00Z' },
  { id: 'lt2', leaveId: 'lv3', action: 'Approved', actor: 'Warden · Graduate C', notes: 'Bed C-118 remains Occupied (FR-040).', at: '2026-03-07T09:00:00Z' },
  { id: 'lt3', leaveId: 'lv3', action: 'Departed', actor: 'Gate desk', notes: 'Pass GP-3C9910 scanned out.', at: '2026-03-08T07:12:00Z' },
  { id: 'lt4', leaveId: 'lv6', action: 'Late return', actor: 'System', notes: 'FR-043 warden alert triggered.', at: '2026-03-10T06:00:00Z' },
  { id: 'lt5', leaveId: 'lv8', action: 'Extension requested', actor: 'Sara Okonkwo', notes: 'New return 2026-03-13 (FR-041).', at: '2026-03-10T19:00:00Z' },
  { id: 'lt6', leaveId: 'lv9', action: 'Rejected', actor: 'Warden · Girls B', notes: 'Mandatory feedback: exam week conflict.', at: '2026-03-08T10:30:00Z' },
];

export function getLeaveById(id: string): LeaveRecord | undefined {
  return SAMPLE_LEAVES.find((l) => l.id === id);
}

export function timelineForLeave(leaveId: string): LeaveTimelineEntry[] {
  return SAMPLE_LEAVE_TIMELINE.filter((e) => e.leaveId === leaveId).sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
  );
}

export function queueLeaves(rows: LeaveRecord[]): LeaveRecord[] {
  const order: Record<string, number> = {
    Overstayed: 0,
    'Extension Pending': 1,
    'Pending Review': 2,
    Approved: 3,
  };
  return rows
    .filter((r) => LEAVE_QUEUE_STATUSES.includes(r.status))
    .sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));
}

export function leaveDurationDays(departure: string, returnDate: string): number {
  const d0 = new Date(departure).getTime();
  const d1 = new Date(returnDate).getTime();
  return Math.max(1, Math.round((d1 - d0) / 86_400_000) + 1);
}

export function formatLeaveDate(iso: string): string {
  if (iso.includes('T')) {
    return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
  }
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(iso));
}

export const LEAVE_STATUS_STYLES: Record<LeaveStatus, string> = {
  'Pending Review':
    'border-[color-mix(in_oklch,var(--nestora-gold)_40%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_15%,var(--card))] text-[var(--nestora-forest)]',
  Approved: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-100',
  'On Leave':
    'border-[color-mix(in_oklch,var(--nestora-sage)_40%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage-light)_50%,var(--card))] text-[var(--nestora-forest)]',
  Returned: 'border-border bg-muted/50 text-muted-foreground',
  Rejected: 'border-destructive/30 bg-destructive/10 text-destructive',
  'Extension Pending': 'border-orange-300 bg-orange-50 text-orange-900 dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-100',
  Overstayed: 'border-red-300 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100',
};
