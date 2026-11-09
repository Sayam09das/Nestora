import type { LucideIcon } from 'lucide-react';
import { Calculator, GraduationCap, ShieldCheck, UserCog } from 'lucide-react';

export type RoleId = 'administrator' | 'warden' | 'student' | 'accountant';

export type RoleShowcase = {
  id: RoleId;
  order: string;
  title: string;
  icon: LucideIcon;
  accessLabel: string;
  points: readonly string[];
  featured?: boolean;
};

export const rolesCopy = {
  eyebrow: 'Designed for every role',
  title: 'One Platform. Different Roles. Complete Control.',
  description:
    'Give every member of your hostel management team the right tools and access to manage their responsibilities efficiently.',
  footnote:
    'Each login sees only the modules and actions allowed for that role—no shared admin keys on every desk.',
} as const;

export const roleShowcases: RoleShowcase[] = [
  {
    id: 'administrator',
    order: '01',
    title: 'Administrator',
    icon: ShieldCheck,
    accessLabel: 'System-wide permissions',
    featured: true,
    points: [
      'Manage the entire hostel',
      'Manage students, rooms, and staff',
      'Configure system settings and permissions',
      'Access reports and operational analytics',
    ],
  },
  {
    id: 'warden',
    order: '02',
    title: 'Warden',
    icon: UserCog,
    accessLabel: 'Operations & student oversight',
    points: [
      'Monitor student activities',
      'Manage room allocation and attendance',
      'Review student complaints',
      'Monitor visitors and daily hostel operations',
    ],
  },
  {
    id: 'student',
    order: '03',
    title: 'Student',
    icon: GraduationCap,
    accessLabel: 'Personal hostel record',
    points: [
      'View personal profile and room details',
      'Check attendance information',
      'View fee and payment status',
      'Submit complaints and maintenance requests',
    ],
  },
  {
    id: 'accountant',
    order: '04',
    title: 'Accountant',
    icon: Calculator,
    accessLabel: 'Fees & finance only',
    points: [
      'Manage hostel fee records',
      'Track payments and pending dues',
      'Maintain payment history',
      'Review fee collection reports',
    ],
  },
];

export const featuredRole = roleShowcases.find((r) => r.featured);
export const supportingRoles = roleShowcases.filter((r) => !r.featured);

export type AccessLevel = 'full' | 'manage' | 'view' | 'finance' | 'none';

export const accessLevelLabels: Record<AccessLevel, string> = {
  full: 'Full access',
  manage: 'Manage',
  view: 'View only',
  finance: 'Fees & reports',
  none: '—',
};

export const roleAccessDetails = {
  title: 'Role access at a glance',
  description:
    'Permissions follow job responsibility—not every screen is visible to every user. Administrators assign roles; changes apply on the next login.',
  rows: [
    {
      area: 'Students & room records',
      administrator: 'full' as const,
      warden: 'manage' as const,
      student: 'view' as const,
      accountant: 'none' as const,
    },
    {
      area: 'Attendance & visitors',
      administrator: 'full' as const,
      warden: 'manage' as const,
      student: 'view' as const,
      accountant: 'none' as const,
    },
    {
      area: 'Complaints & maintenance',
      administrator: 'full' as const,
      warden: 'manage' as const,
      student: 'view' as const,
      accountant: 'none' as const,
    },
    {
      area: 'Fees & payments',
      administrator: 'full' as const,
      warden: 'none' as const,
      student: 'view' as const,
      accountant: 'finance' as const,
    },
    {
      area: 'Reports & settings',
      administrator: 'full' as const,
      warden: 'view' as const,
      student: 'none' as const,
      accountant: 'view' as const,
    },
  ],
  highlights: [
    'Students see only their own profile, room, attendance, fees, and tickets they raised.',
    'Wardens cannot change system settings or fee ledgers without administrator access.',
    'Accountants work in fees and collection reports—not student discipline or room moves.',
  ],
  legendTitle: 'Access key',
  legendNotes: [
    'Full access — configure modules, records, and institutional settings.',
    'Manage — operate assigned hostel areas without changing system-wide rules.',
    'View only — read personal or scoped records; no edits to other residents.',
    'Fees & reports — finance workspace only; no student or room administration.',
  ],
} as const;
