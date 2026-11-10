import {
  Droplets,
  Hammer,
  Paintbrush,
  Sparkles,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export type ComplaintStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Rejected'
  | 'Reopened';

export type ComplaintCategory = 'Electrical' | 'Plumbing' | 'Carpentry' | 'Cleaning' | 'Civil';
export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type ComplaintTicket = {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  location: string;
  hostel: string;
  block: string;
  studentName: string;
  studentId: string;
  suggestedPriority: ComplaintPriority;
  finalPriority: ComplaintPriority | null;
  status: ComplaintStatus;
  assignedStaff: string | null;
  hasPhoto: boolean;
  openedAt: string;
  updatedAt: string;
  slaHours: number;
  slaBreached: boolean;
};

export type ComplaintTimelineEntry = {
  id: string;
  ticketId: string;
  status: ComplaintStatus;
  actor: string;
  notes: string | null;
  at: string;
};

export const COMPLAINT_STATS = {
  openTickets: 11,
  slaAtRisk: 4,
  resolvedThisWeek: 18,
  avgTurnaroundHours: 26,
  reopened: 2,
  categoryHotspot: 'Electrical',
} as const;

export const BOARD_COLUMN_STATUSES: ComplaintStatus[] = [
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
];

export const COMPLAINT_HOSTEL_FILTERS = ['All Hostels', 'Boys Hostel A', 'Girls Hostel B', 'Graduate Block C'] as const;
export const COMPLAINT_CATEGORY_FILTERS = ['All Categories', 'Electrical', 'Plumbing', 'Carpentry', 'Cleaning', 'Civil'] as const;
export const COMPLAINT_PRIORITY_FILTERS = ['All Priorities', 'Low', 'Medium', 'High', 'Critical'] as const;
export const COMPLAINT_STATUS_FILTERS = [
  'All Status',
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
  'Rejected',
  'Reopened',
] as const;

export const CATEGORY_META: Record<
  ComplaintCategory,
  { icon: LucideIcon; accent: string; department: string }
> = {
  Electrical: { icon: Zap, accent: '#d97706', department: 'Electrical' },
  Plumbing: { icon: Droplets, accent: '#0284c7', department: 'Plumbing' },
  Carpentry: { icon: Hammer, accent: '#78716c', department: 'Carpentry' },
  Cleaning: { icon: Sparkles, accent: '#6d9773', department: 'Housekeeping' },
  Civil: { icon: Paintbrush, accent: '#7c3aed', department: 'Civil works' },
};

export const STAFF_BY_CATEGORY: Record<ComplaintCategory, Array<{ id: string; name: string; shift: string }>> = {
  Electrical: [
    { id: 'st-el-1', name: 'R. Menon', shift: 'Day' },
    { id: 'st-el-2', name: 'A. Dutta', shift: 'Evening' },
  ],
  Plumbing: [
    { id: 'st-pl-1', name: 'V. Iyer', shift: 'Day' },
    { id: 'st-pl-2', name: 'K. Singh', shift: 'On-call' },
  ],
  Carpentry: [{ id: 'st-ca-1', name: 'M. Rao', shift: 'Day' }],
  Cleaning: [
    { id: 'st-cl-1', name: 'P. Kumari', shift: 'Morning' },
    { id: 'st-cl-2', name: 'S. Ali', shift: 'Evening' },
  ],
  Civil: [{ id: 'st-cv-1', name: 'J. Thomas', shift: 'Day' }],
};

export const SAMPLE_COMPLAINTS: ComplaintTicket[] = [
  {
    id: 'cmp1',
    ticketNumber: 'CMP-2026-0184',
    title: 'Wi‑Fi dead zone · Block B',
    description: 'No connectivity past the stairwell on floor 3. Affects rooms B-312 through B-318.',
    category: 'Electrical',
    location: 'Block B · Floor 3 corridor',
    hostel: 'Boys Hostel A',
    block: 'Block B',
    studentName: 'Arjun Mehta',
    studentId: 'STU-10482',
    suggestedPriority: 'Medium',
    finalPriority: 'High',
    status: 'Under Review',
    assignedStaff: null,
    hasPhoto: true,
    openedAt: '2026-03-08T09:20:00Z',
    updatedAt: '2026-03-09T14:05:00Z',
    slaHours: 48,
    slaBreached: false,
  },
  {
    id: 'cmp2',
    ticketNumber: 'CMP-2026-0191',
    title: 'Shower leak · ensuite',
    description: 'Constant drip from shower head mount; water pooling near drain.',
    category: 'Plumbing',
    location: 'Girls Hostel B · Room G-204',
    hostel: 'Girls Hostel B',
    block: 'Block G',
    studentName: 'Priya Nair',
    studentId: 'STU-09112',
    suggestedPriority: 'High',
    finalPriority: 'High',
    status: 'In Progress',
    assignedStaff: 'V. Iyer',
    hasPhoto: true,
    openedAt: '2026-03-07T18:40:00Z',
    updatedAt: '2026-03-10T08:00:00Z',
    slaHours: 24,
    slaBreached: false,
  },
  {
    id: 'cmp3',
    ticketNumber: 'CMP-2026-0195',
    title: 'Loose desk bracket',
    description: 'Study desk wobbles; wall bracket screws stripped.',
    category: 'Carpentry',
    location: 'Graduate Block C · C-118',
    hostel: 'Graduate Block C',
    block: 'Block C',
    studentName: 'Daniel Wu',
    studentId: 'STU-11003',
    suggestedPriority: 'Low',
    finalPriority: 'Medium',
    status: 'Assigned',
    assignedStaff: 'M. Rao',
    hasPhoto: false,
    openedAt: '2026-03-09T11:15:00Z',
    updatedAt: '2026-03-09T16:30:00Z',
    slaHours: 72,
    slaBreached: false,
  },
  {
    id: 'cmp4',
    ticketNumber: 'CMP-2026-0172',
    title: 'Common bath not cleaned',
    description: 'Floor 2 west wing bathroom missed in morning roster.',
    category: 'Cleaning',
    location: 'Boys Hostel A · Block A · Floor 2',
    hostel: 'Boys Hostel A',
    block: 'Block A',
    studentName: 'Rohan Das',
    studentId: 'STU-10241',
    suggestedPriority: 'Medium',
    finalPriority: 'Medium',
    status: 'Resolved',
    assignedStaff: 'P. Kumari',
    hasPhoto: false,
    openedAt: '2026-03-05T07:50:00Z',
    updatedAt: '2026-03-06T15:20:00Z',
    slaHours: 24,
    slaBreached: false,
  },
  {
    id: 'cmp5',
    ticketNumber: 'CMP-2026-0201',
    title: 'Cracked window seal',
    description: 'Draft and rattling during wind; safety concern on bay window.',
    category: 'Civil',
    location: 'Girls Hostel B · G-401 common lounge',
    hostel: 'Girls Hostel B',
    block: 'Block G',
    studentName: 'Meera Shah',
    studentId: 'STU-08877',
    suggestedPriority: 'High',
    finalPriority: 'Critical',
    status: 'Submitted',
    assignedStaff: null,
    hasPhoto: true,
    openedAt: '2026-03-10T06:10:00Z',
    updatedAt: '2026-03-10T06:10:00Z',
    slaHours: 12,
    slaBreached: false,
  },
  {
    id: 'cmp6',
    ticketNumber: 'CMP-2026-0188',
    title: 'Tripping MCB · laundry',
    description: 'Breaker trips when both dryers run; sparks reported once.',
    category: 'Electrical',
    location: 'Boys Hostel A · Laundry wing',
    hostel: 'Boys Hostel A',
    block: 'Block A',
    studentName: 'Vikram Joshi',
    studentId: 'STU-10655',
    suggestedPriority: 'Critical',
    finalPriority: 'Critical',
    status: 'In Progress',
    assignedStaff: 'R. Menon',
    hasPhoto: false,
    openedAt: '2026-03-08T20:00:00Z',
    updatedAt: '2026-03-10T07:45:00Z',
    slaHours: 8,
    slaBreached: true,
  },
  {
    id: 'cmp7',
    ticketNumber: 'CMP-2026-0165',
    title: 'Hot water outage',
    description: 'No hot water in entire wing since yesterday evening.',
    category: 'Plumbing',
    location: 'Graduate Block C · East wing',
    hostel: 'Graduate Block C',
    block: 'Block C',
    studentName: 'Sara Okonkwo',
    studentId: 'STU-10901',
    suggestedPriority: 'High',
    finalPriority: 'High',
    status: 'Reopened',
    assignedStaff: 'K. Singh',
    hasPhoto: false,
    openedAt: '2026-03-04T22:30:00Z',
    updatedAt: '2026-03-09T19:00:00Z',
    slaHours: 24,
    slaBreached: true,
  },
  {
    id: 'cmp8',
    ticketNumber: 'CMP-2026-0204',
    title: 'Door handle loose',
    description: 'Main room door handle spins; lock alignment off.',
    category: 'Carpentry',
    location: 'Boys Hostel A · B-215',
    hostel: 'Boys Hostel A',
    block: 'Block B',
    studentName: 'Neil Kapoor',
    studentId: 'STU-10333',
    suggestedPriority: 'Medium',
    finalPriority: null,
    status: 'Submitted',
    assignedStaff: null,
    hasPhoto: false,
    openedAt: '2026-03-10T10:30:00Z',
    updatedAt: '2026-03-10T10:30:00Z',
    slaHours: 48,
    slaBreached: false,
  },
  {
    id: 'cmp9',
    ticketNumber: 'CMP-2026-0179',
    title: 'Flickering corridor lights',
    description: 'Alternating tubes on B-3 corridor; one buzzes loudly.',
    category: 'Electrical',
    location: 'Block B · Floor 3',
    hostel: 'Boys Hostel A',
    block: 'Block B',
    studentName: 'Ishaan Roy',
    studentId: 'STU-10590',
    suggestedPriority: 'Low',
    finalPriority: 'Medium',
    status: 'Assigned',
    assignedStaff: 'A. Dutta',
    hasPhoto: true,
    openedAt: '2026-03-06T13:00:00Z',
    updatedAt: '2026-03-08T09:00:00Z',
    slaHours: 48,
    slaBreached: false,
  },
  {
    id: 'cmp10',
    ticketNumber: 'CMP-2026-0198',
    title: 'Mould patch · wardrobe',
    description: 'Dark patch behind wardrobe; damp smell after rain.',
    category: 'Civil',
    location: 'Girls Hostel B · G-208',
    hostel: 'Girls Hostel B',
    block: 'Block G',
    studentName: 'Ananya Krishnan',
    studentId: 'STU-09220',
    suggestedPriority: 'Medium',
    finalPriority: 'High',
    status: 'Under Review',
    assignedStaff: null,
    hasPhoto: true,
    openedAt: '2026-03-09T08:45:00Z',
    updatedAt: '2026-03-10T11:00:00Z',
    slaHours: 36,
    slaBreached: false,
  },
];

export const SAMPLE_TIMELINE: ComplaintTimelineEntry[] = [
  {
    id: 'tl-1',
    ticketId: 'cmp1',
    status: 'Submitted',
    actor: 'Arjun Mehta',
    notes: 'Photo attached · suggested Medium priority.',
    at: '2026-03-08T09:20:00Z',
  },
  {
    id: 'tl-2',
    ticketId: 'cmp1',
    status: 'Under Review',
    actor: 'Warden · Block B',
    notes: 'Escalated to High — exam week connectivity.',
    at: '2026-03-09T14:05:00Z',
  },
  {
    id: 'tl-3',
    ticketId: 'cmp2',
    status: 'Submitted',
    actor: 'Priya Nair',
    notes: null,
    at: '2026-03-07T18:40:00Z',
  },
  {
    id: 'tl-4',
    ticketId: 'cmp2',
    status: 'Assigned',
    actor: 'Warden · Girls B',
    notes: 'Category match → V. Iyer (Plumbing).',
    at: '2026-03-08T08:15:00Z',
  },
  {
    id: 'tl-5',
    ticketId: 'cmp2',
    status: 'In Progress',
    actor: 'V. Iyer',
    notes: 'Parts ordered; ETA 4h for gasket kit.',
    at: '2026-03-10T08:00:00Z',
  },
  {
    id: 'tl-6',
    ticketId: 'cmp6',
    status: 'In Progress',
    actor: 'R. Menon',
    notes: 'Isolated circuit; both dryers offline until repair.',
    at: '2026-03-10T07:45:00Z',
  },
  {
    id: 'tl-7',
    ticketId: 'cmp7',
    status: 'Reopened',
    actor: 'Sara Okonkwo',
    notes: 'Hot water returned briefly then failed again.',
    at: '2026-03-09T19:00:00Z',
  },
];

export function getComplaintById(id: string): ComplaintTicket | undefined {
  return SAMPLE_COMPLAINTS.find((t) => t.id === id);
}

export function timelineForTicket(ticketId: string): ComplaintTimelineEntry[] {
  return SAMPLE_TIMELINE.filter((e) => e.ticketId === ticketId).sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
  );
}

export function boardStatusForTicket(status: ComplaintStatus): ComplaintStatus {
  if (status === 'Reopened' || status === 'Rejected') return 'Under Review';
  return status;
}

export function effectivePriority(ticket: ComplaintTicket): ComplaintPriority {
  return ticket.finalPriority ?? ticket.suggestedPriority;
}

export function formatComplaintWhen(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

export function hoursOpenSince(iso: string): number {
  return Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 3_600_000));
}

export function slaRemainingHours(ticket: ComplaintTicket): number {
  const elapsed = hoursOpenSince(ticket.openedAt);
  return ticket.slaHours - elapsed;
}

export const PRIORITY_STYLES: Record<ComplaintPriority, string> = {
  Low: 'border-[color-mix(in_oklch,var(--nestora-sage)_40%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-cream)_30%,var(--card))] text-muted-foreground',
  Medium:
    'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100',
  High: 'border-orange-300 bg-orange-50 text-orange-900 dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-100',
  Critical: 'border-red-300 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100',
};
