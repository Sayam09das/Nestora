import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  BedDouble,
  CalendarCheck,
  CreditCard,
  DoorOpen,
  Shield,
  UserCheck,
  Users,
  Wrench,
} from 'lucide-react';

export type FeaturePreviewKind =
  | 'students'
  | 'rooms'
  | 'fees'
  | 'gate'
  | 'attendance'
  | 'complaints'
  | 'visitors'
  | 'staff'
  | 'reports';

export type FeatureModule = {
  id: string;
  title: string;
  points: readonly string[];
  icon: LucideIcon;
  tier: 'primary' | 'support';
  preview: FeaturePreviewKind;
};

export type SupportModuleDetail = {
  summary: string;
  workflow: readonly string[];
  connections: readonly string[];
  outcome: string;
  highlights: readonly { label: string; value: string }[];
};

export const supportModuleDetails: Record<string, SupportModuleDetail> = {
  attendance: {
    summary:
      'Record who is in the hostel each day, drill into a student’s history, and spot absences before they become a pattern.',
    workflow: [
      'Mark morning or evening roll call by floor',
      'Review absent students and add notes',
      'Share weekly summary with management',
    ],
    connections: ['Student profiles', 'Room assignment', 'Guardian contacts'],
    outcome: 'Fewer surprise absences because daily counts tie back to each resident’s record.',
    highlights: [
      { label: 'Daily records', value: 'Block or floor roll call' },
      { label: 'History', value: 'Per-student attendance log' },
      { label: 'Summaries', value: 'Weekly and monthly views' },
      { label: 'Absence tracking', value: 'Flagged follow-ups' },
    ],
  },
  complaints: {
    summary:
      'Students log issues from their profile; wardens track maintenance tickets through open, in progress, and resolved.',
    workflow: [
      'Student submits complaint with room details',
      'Warden assigns priority and owner',
      'Close ticket with resolution notes',
    ],
    connections: ['Student & room', 'Staff assignee', 'Maintenance log'],
    outcome: 'Open issues stay visible until closed—nothing lost in notebooks or chat.',
    highlights: [
      { label: 'Submission', value: 'Linked to room and student' },
      { label: 'Status', value: 'Open → in review → closed' },
      { label: 'Maintenance', value: 'Facilities work orders' },
      { label: 'Resolution', value: 'Notes and closure date' },
    ],
  },
  visitors: {
    summary:
      'Register guests at the gate, check them in and out on the day, and see visit history tied to each student.',
    workflow: [
      'Register visitor ID and host student',
      'Check in at security desk',
      'Check out and archive visit record',
    ],
    connections: ['Student host', 'Room block', 'Security desk log'],
    outcome: 'Every guest is traceable to a student and timestamp for audit readiness.',
    highlights: [
      { label: 'Registration', value: 'ID and purpose captured' },
      { label: 'Check-in / out', value: 'Time-stamped at desk' },
      { label: 'Visit history', value: 'Searchable visitor log' },
      { label: 'Student view', value: 'Visits per resident' },
    ],
  },
  staff: {
    summary:
      'Keep warden and support staff profiles, roles, and duty rosters in one place alongside hostel operations.',
    workflow: [
      'Maintain staff profile and contact details',
      'Assign role, block, and shift pattern',
      'Publish weekly duty roster for handover',
    ],
    connections: ['Complaint ownership', 'Visitor desk', 'Block coverage'],
    outcome: 'Everyone knows who is on duty and who owns each block tonight.',
    highlights: [
      { label: 'Profiles', value: 'Contact and role on file' },
      { label: 'Responsibilities', value: 'Block or shift assignment' },
      { label: 'Duty tracking', value: 'On-duty and night roster' },
      { label: 'Records', value: 'Employment and notes' },
    ],
  },
  reports: {
    summary:
      'Pull occupancy, student counts, fee collection, and day-to-day trends without exporting to spreadsheets first.',
    workflow: [
      'Choose report type and date range',
      'Filter by block or fee category',
      'Export or share snapshot with leadership',
    ],
    connections: ['Room occupancy', 'Fee ledger', 'Student census'],
    outcome: 'Leadership reviews real hostel numbers without manual spreadsheet builds.',
    highlights: [
      { label: 'Occupancy', value: 'Beds filled by block' },
      { label: 'Student stats', value: 'Headcount and status' },
      { label: 'Fee collection', value: 'Paid vs pending' },
      { label: 'Operations', value: 'Trends for leadership' },
    ],
  },
};

export const featuresCopy = {
  eyebrow: 'Powerful features',
  title: 'Everything Your Hostel Needs. All in One Place.',
  description:
    'Manage students, rooms, payments, staff, and daily hostel operations through one connected platform.',
} as const;

export const featureModules: FeatureModule[] = [
  {
    id: 'students',
    title: 'Student management',
    tier: 'primary',
    icon: Users,
    preview: 'students',
    points: [
      'Student registration and profiles',
      'Personal and academic information',
      'Guardian and emergency contacts',
      'Student status and records',
    ],
  },
  {
    id: 'fees',
    title: 'Fees & payments',
    tier: 'primary',
    icon: CreditCard,
    preview: 'fees',
    points: [
      'Hostel fee management',
      'Payment records and history',
      'Pending fee tracking',
      'Payment status monitoring',
    ],
  },
  {
    id: 'rooms',
    title: 'Room & bed allocation',
    tier: 'primary',
    icon: BedDouble,
    preview: 'rooms',
    points: [
      'Room and bed availability',
      'Assignment and transfers',
      'Occupancy tracking',
      'Capacity management',
    ],
  },
  {
    id: 'gate-passes',
    title: 'Gate passes & outings',
    tier: 'primary',
    icon: DoorOpen,
    preview: 'gate',
    points: [
      'Day and overnight pass requests',
      'Curfew and return-time tracking',
      'Warden and guardian approvals',
      'Live in-dorm headcount sync',
    ],
  },
  {
    id: 'attendance',
    title: 'Attendance management',
    tier: 'support',
    icon: CalendarCheck,
    preview: 'attendance',
    points: [
      'Daily attendance records',
      'Student attendance history',
      'Attendance summaries',
      'Absence tracking',
    ],
  },
  {
    id: 'complaints',
    title: 'Complaints & maintenance',
    tier: 'support',
    icon: Wrench,
    preview: 'complaints',
    points: [
      'Student complaint submission',
      'Complaint status tracking',
      'Maintenance requests',
      'Issue resolution management',
    ],
  },
  {
    id: 'visitors',
    title: 'Visitor management',
    tier: 'support',
    icon: UserCheck,
    preview: 'visitors',
    points: [
      'Visitor registration',
      'Check-in and check-out records',
      'Visit history',
      'Student-wise visitor tracking',
    ],
  },
  {
    id: 'staff',
    title: 'Staff management',
    tier: 'support',
    icon: Shield,
    preview: 'staff',
    points: [
      'Staff profiles and records',
      'Staff roles and responsibilities',
      'Duty and assignment tracking',
      'Staff employment records',
    ],
  },
  {
    id: 'reports',
    title: 'Reports & analytics',
    tier: 'support',
    icon: BarChart3,
    preview: 'reports',
    points: [
      'Hostel occupancy reports',
      'Student statistics',
      'Fee collection summaries',
      'Operational insights',
    ],
  },
];

export const primaryModules = featureModules.filter((m) => m.tier === 'primary');
export const supportModules = featureModules.filter((m) => m.tier === 'support');
