import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  BedDouble,
  CalendarCheck,
  CreditCard,
  Shield,
  UserCheck,
  Users,
  Wrench,
} from 'lucide-react';

export type FeaturePreviewKind =
  | 'students'
  | 'rooms'
  | 'fees'
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
    id: 'attendance',
    title: 'Attendance management',
    tier: 'support',
    icon: CalendarCheck,
    preview: 'attendance',
    points: [
      'Daily attendance records',
      'History and summaries',
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
      'Complaint submission and status',
      'Maintenance requests',
      'Issue resolution tracking',
    ],
  },
  {
    id: 'visitors',
    title: 'Visitor management',
    tier: 'support',
    icon: UserCheck,
    preview: 'visitors',
    points: ['Visitor registration', 'Check-in and check-out', 'Student-wise visit history'],
  },
  {
    id: 'staff',
    title: 'Staff management',
    tier: 'support',
    icon: Shield,
    preview: 'staff',
    points: ['Staff profiles and roles', 'Responsibilities', 'Duty and assignment tracking'],
  },
  {
    id: 'reports',
    title: 'Reports & analytics',
    tier: 'support',
    icon: BarChart3,
    preview: 'reports',
    points: [
      'Occupancy and student statistics',
      'Fee collection summaries',
      'Operational insights',
    ],
  },
];

export const primaryModules = featureModules.filter((m) => m.tier === 'primary');
export const supportModules = featureModules.filter((m) => m.tier === 'support');
