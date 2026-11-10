import {
  AlertTriangle,
  Hammer,
  Megaphone,
  PartyPopper,
  Receipt,
  ScrollText,
  type LucideIcon,
} from 'lucide-react';

export type NoticeCategory =
  | 'General'
  | 'Hostel Rules'
  | 'Fees'
  | 'Maintenance'
  | 'Emergency'
  | 'Events';

export type NoticeStatus = 'Live' | 'Scheduled' | 'Expired' | 'Draft';

export type NoticeScope = 'University-wide' | 'Boys Hostel A' | 'Girls Hostel B' | 'Graduate Block C';

export type AnnouncementRecord = {
  id: string;
  noticeRef: string;
  title: string;
  excerpt: string;
  body: string;
  category: NoticeCategory;
  scope: NoticeScope;
  status: NoticeStatus;
  publishedAt: string;
  expiresAt: string | null;
  publishedBy: string;
  requiresAcknowledgement: boolean;
  acknowledgedCount: number;
  targetCount: number;
  hasAttachment: boolean;
  pinned: boolean;
};

export const ANNOUNCEMENT_STATS = {
  liveNow: 2,
  scheduled: 3,
  ackPending: 184,
  avgReadRate: 78,
  emergencyActive: 0,
  publishedThisMonth: 14,
} as const;

export const NOTICE_CATEGORY_FILTERS = [
  'All Categories',
  'General',
  'Hostel Rules',
  'Fees',
  'Maintenance',
  'Emergency',
  'Events',
] as const;

export const NOTICE_SCOPE_FILTERS = [
  'All Scopes',
  'University-wide',
  'Boys Hostel A',
  'Girls Hostel B',
  'Graduate Block C',
] as const;

export const NOTICE_STATUS_FILTERS = ['All Status', 'Live', 'Scheduled', 'Expired', 'Draft'] as const;

export const CATEGORY_META: Record<NoticeCategory, { icon: LucideIcon; accent: string }> = {
  General: { icon: Megaphone, accent: 'var(--nestora-sage)' },
  'Hostel Rules': { icon: ScrollText, accent: 'var(--nestora-forest)' },
  Fees: { icon: Receipt, accent: '#d97706' },
  Maintenance: { icon: Hammer, accent: '#78716c' },
  Emergency: { icon: AlertTriangle, accent: '#dc2626' },
  Events: { icon: PartyPopper, accent: '#7c3aed' },
};

export const SAMPLE_ANNOUNCEMENTS: AnnouncementRecord[] = [
  {
    id: 'ann1',
    noticeRef: 'NTC-2026-0188',
    title: 'Mess timing update — Block C',
    excerpt: 'Dinner service shifts to 7:00–9:30 PM through exam fortnight.',
    body: 'Graduate Block C mess will run extended dinner service from 12 Mar through 26 Mar. Breakfast and lunch timings stay unchanged. Bring student ID cards — late entry after 9:15 PM will require warden SMS pass.',
    category: 'General',
    scope: 'Graduate Block C',
    status: 'Live',
    publishedAt: '2026-03-10T08:00:00Z',
    expiresAt: '2026-03-26T23:59:00Z',
    publishedBy: 'Warden · Graduate C',
    requiresAcknowledgement: false,
    acknowledgedCount: 0,
    targetCount: 0,
    hasAttachment: false,
    pinned: true,
  },
  {
    id: 'ann2',
    noticeRef: 'NTC-2026-0182',
    title: 'Hostel week maintenance window',
    excerpt: 'Water shutdown Sun 6am–10am · Blocks A & B.',
    body: 'Planned valve replacement on the primary line. Store water Sunday morning. Laundry suspended 5am–11am. Emergency contact: Facilities desk ext. 402.',
    category: 'Maintenance',
    scope: 'Boys Hostel A',
    status: 'Live',
    publishedAt: '2026-03-09T12:00:00Z',
    expiresAt: '2026-03-16T23:59:00Z',
    publishedBy: 'Facilities · Nestora',
    requiresAcknowledgement: true,
    acknowledgedCount: 312,
    targetCount: 420,
    hasAttachment: true,
    pinned: true,
  },
  {
    id: 'ann3',
    noticeRef: 'NTC-2026-0175',
    title: 'Term fee installment — 15 Mar deadline',
    excerpt: 'Second installment due; pay via portal or accounts desk.',
    body: 'Students with approved installment plans must clear the second tranche by 15 Mar 2026. Late fee applies after grace window. See attached schedule PDF.',
    category: 'Fees',
    scope: 'University-wide',
    status: 'Live',
    publishedAt: '2026-03-08T09:30:00Z',
    expiresAt: '2026-03-15T23:59:00Z',
    publishedBy: 'University Admin',
    requiresAcknowledgement: true,
    acknowledgedCount: 892,
    targetCount: 1240,
    hasAttachment: true,
    pinned: false,
  },
  {
    id: 'ann4',
    noticeRef: 'NTC-2026-0190',
    title: 'Quiet hours — exam policy',
    excerpt: '10 PM–6 AM silence corridors; noise complaints logged.',
    body: 'From 12 Mar, wardens will enforce quiet hours across all blocks. Group study allowed only in designated reading rooms. Third violation triggers disciplinary note.',
    category: 'Hostel Rules',
    scope: 'University-wide',
    status: 'Scheduled',
    publishedAt: '2026-03-12T00:00:00Z',
    expiresAt: '2026-04-30T23:59:00Z',
    publishedBy: 'University Admin',
    requiresAcknowledgement: true,
    acknowledgedCount: 0,
    targetCount: 1240,
    hasAttachment: false,
    pinned: false,
  },
  {
    id: 'ann5',
    noticeRef: 'NTC-2026-0160',
    title: 'Inter-hostel sports meet — 22 Mar',
    excerpt: 'Register teams by 18 Mar; captains meeting Fri 5 PM.',
    body: 'Annual sports meet at central ground. Events: cricket, volleyball, relay. Girls Hostel B gym open for warm-ups 4–6 PM on event day.',
    category: 'Events',
    scope: 'University-wide',
    status: 'Live',
    publishedAt: '2026-03-07T11:00:00Z',
    expiresAt: '2026-03-22T23:59:00Z',
    publishedBy: 'Sports Council',
    requiresAcknowledgement: false,
    acknowledgedCount: 0,
    targetCount: 0,
    hasAttachment: false,
    pinned: false,
  },
  {
    id: 'ann6',
    noticeRef: 'NTC-2026-0142',
    title: 'Fire drill — Girls Hostel B',
    excerpt: 'Mandatory evacuation drill Wed 4 PM.',
    body: 'All residents must assemble at ground east lawn. No lifts. Wardens will verify room clearance. Failure to participate requires counselling session.',
    category: 'Emergency',
    scope: 'Girls Hostel B',
    status: 'Expired',
    publishedAt: '2026-02-28T10:00:00Z',
    expiresAt: '2026-03-05T23:59:00Z',
    publishedBy: 'Warden · Girls B',
    requiresAcknowledgement: true,
    acknowledgedCount: 198,
    targetCount: 198,
    hasAttachment: false,
    pinned: false,
  },
  {
    id: 'ann7',
    noticeRef: 'NTC-2026-0192',
    title: 'Visitor policy — ID mandatory',
    excerpt: 'Guests without valid ID will be turned away at gate.',
    body: 'Effective immediately, all visitors must present government ID matching the pre-registration SMS. Host must escort guest inside common areas only.',
    category: 'Hostel Rules',
    scope: 'Boys Hostel A',
    status: 'Live',
    publishedAt: '2026-03-10T06:30:00Z',
    expiresAt: null,
    publishedBy: 'Warden · Block A',
    requiresAcknowledgement: false,
    acknowledgedCount: 0,
    targetCount: 0,
    hasAttachment: false,
    pinned: false,
  },
  {
    id: 'ann8',
    noticeRef: 'NTC-2026-0185',
    title: 'Wi‑Fi maintenance — Block B',
    excerpt: 'Brief outage tonight 11:30 PM – 1:00 AM.',
    body: 'Core switch firmware upgrade. Download large files before 11 PM. Complaints desk remains on wired fallback.',
    category: 'Maintenance',
    scope: 'Boys Hostel A',
    status: 'Scheduled',
    publishedAt: '2026-03-11T23:30:00Z',
    expiresAt: '2026-03-12T01:30:00Z',
    publishedBy: 'IT Nestora',
    requiresAcknowledgement: false,
    acknowledgedCount: 0,
    targetCount: 0,
    hasAttachment: false,
    pinned: false,
  },
  {
    id: 'ann9',
    noticeRef: 'NTC-DRAFT-004',
    title: 'Monsoon prep checklist (draft)',
    excerpt: 'Internal draft — not visible to students.',
    body: 'Wardens to verify drainage, tarpaulins, and emergency kits before Apr 1.',
    category: 'General',
    scope: 'University-wide',
    status: 'Draft',
    publishedAt: '2026-03-10T14:00:00Z',
    expiresAt: null,
    publishedBy: 'University Admin',
    requiresAcknowledgement: false,
    acknowledgedCount: 0,
    targetCount: 0,
    hasAttachment: true,
    pinned: false,
  },
];

export function getAnnouncementById(id: string): AnnouncementRecord | undefined {
  return SAMPLE_ANNOUNCEMENTS.find((n) => n.id === id);
}

export function ackRate(record: AnnouncementRecord): number {
  if (!record.requiresAcknowledgement || record.targetCount === 0) return 0;
  return Math.round((record.acknowledgedCount / record.targetCount) * 100);
}

export function formatNoticeWhen(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
}

export function formatNoticeDate(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(iso));
}

export const NOTICE_STATUS_STYLES: Record<NoticeStatus, string> = {
  Live: 'border-[color-mix(in_oklch,var(--nestora-sage)_40%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage-light)_45%,var(--card))] text-[var(--nestora-forest)]',
  Scheduled: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-100',
  Expired: 'border-border bg-muted/50 text-muted-foreground',
  Draft: 'border-dashed border-[color-mix(in_oklch,var(--nestora-gold)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-cream)_20%,var(--card))] text-muted-foreground',
};

export type AckSampleRow = { id: string; studentName: string; block: string; status: 'Acknowledged' | 'Pending' };

export const SAMPLE_ACK_ROSTER: Record<string, AckSampleRow[]> = {
  ann2: [
    { id: 'a1', studentName: 'Arjun Mehta', block: 'B-312', status: 'Acknowledged' },
    { id: 'a2', studentName: 'Neil Kapoor', block: 'B-215', status: 'Pending' },
    { id: 'a3', studentName: 'Vikram Joshi', block: 'B-108', status: 'Acknowledged' },
    { id: 'a4', studentName: 'Rohan Das', block: 'A-215', status: 'Pending' },
  ],
  ann3: [
    { id: 'b1', studentName: 'Priya Nair', block: 'G-204', status: 'Acknowledged' },
    { id: 'b2', studentName: 'Meera Shah', block: 'G-401', status: 'Acknowledged' },
    { id: 'b3', studentName: 'Daniel Wu', block: 'C-118', status: 'Pending' },
  ],
};

export const COMPOSE_CATEGORIES: NoticeCategory[] = [
  'General',
  'Hostel Rules',
  'Fees',
  'Maintenance',
  'Emergency',
  'Events',
];

export const COMPOSE_SCOPES: NoticeScope[] = [
  'University-wide',
  'Boys Hostel A',
  'Girls Hostel B',
  'Graduate Block C',
];
