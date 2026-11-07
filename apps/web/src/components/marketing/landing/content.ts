import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  BedDouble,
  Bell,
  ClipboardCheck,
  CreditCard,
  Plane,
  Shield,
  UserCheck,
  Users,
  Wrench,
} from 'lucide-react';

export const trustHighlights = [
  {
    title: 'Centralized operations',
    description: 'Keep students, rooms, attendance, and fees in one workspace built for hostel teams.',
  },
  {
    title: 'Structured room allocation',
    description: 'Assign beds and blocks with clear records instead of scattered spreadsheets.',
  },
  {
    title: 'Organized student records',
    description: 'Track hostel profiles, documents, and history where staff already work.',
  },
  {
    title: 'Transparent fee tracking',
    description: 'See dues, payments, and reminders with less manual follow-up.',
  },
] as const;

export type FeatureItem = {
  title: string;
  description: string;
  icon: LucideIcon;
  emphasis?: 'default' | 'wide';
};

export const featureItems: FeatureItem[] = [
  {
    title: 'Student management',
    description: 'Profiles, hostel assignments, and lifecycle updates in one place.',
    icon: Users,
    emphasis: 'wide',
  },
  {
    title: 'Room and bed allocation',
    description: 'Map capacity, vacancies, and swaps with a clear room view.',
    icon: BedDouble,
    emphasis: 'wide',
  },
  {
    title: 'Hostel attendance',
    description: 'Daily roll call and presence logs aligned to your hostel rules.',
    icon: ClipboardCheck,
  },
  {
    title: 'Fee and payment management',
    description: 'Track charges, receipts, and outstanding balances by student.',
    icon: CreditCard,
  },
  {
    title: 'Leave management',
    description: 'Approvals and return dates without losing context in chat threads.',
    icon: Plane,
  },
  {
    title: 'Complaint and maintenance',
    description: 'Log issues, assign staff, and close the loop with status history.',
    icon: Wrench,
  },
  {
    title: 'Visitor management',
    description: 'Register guests, visiting hours, and entry notes for wardens.',
    icon: UserCheck,
  },
  {
    title: 'Staff and warden tools',
    description: 'Role-aware views so each team sees what they need to act on.',
    icon: Shield,
  },
  {
    title: 'Reports and analytics',
    description: 'Occupancy, fee, and activity summaries for leadership reviews.',
    icon: BarChart3,
  },
  {
    title: 'Notifications',
    description: 'Timely alerts for fees, attendance gaps, and operational events.',
    icon: Bell,
  },
];

export const howItWorksSteps = [
  {
    step: '1',
    title: 'Register your hostel',
    description: 'Set up blocks, policies, and staff access for your institution.',
  },
  {
    step: '2',
    title: 'Add students and rooms',
    description: 'Import or create records and align beds to your floor plan.',
  },
  {
    step: '3',
    title: 'Run daily operations',
    description: 'Attendance, fees, visitors, and maintenance from one dashboard.',
  },
  {
    step: '4',
    title: 'Review activity and reports',
    description: 'Monitor trends and export summaries for accountable decisions.',
  },
] as const;

export const roleCards = [
  {
    title: 'Hostel administrators',
    description: 'Configure hostels, oversee capacity, and enforce institutional policy.',
  },
  {
    title: 'Wardens',
    description: 'Supervise floors, attendance, discipline, and day-to-day student life.',
  },
  {
    title: 'Hostel staff',
    description: 'Handle maintenance, front desk, and operational tasks with clear queues.',
  },
  {
    title: 'Students',
    description: 'View room details, submit requests, and stay informed on fees and leave.',
  },
] as const;

export const benefitBullets = [
  'Less manual paperwork across rooms, fees, and attendance.',
  'Better room utilization with live vacancy context.',
  'Easier fee tracking and follow-up for hostel accounts.',
  'Improved visibility into complaints and maintenance.',
  'Centralized student and visitor information.',
  'More organized communication between staff and students.',
] as const;
