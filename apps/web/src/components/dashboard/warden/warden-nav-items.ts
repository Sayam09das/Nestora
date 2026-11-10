import type { LucideIcon } from 'lucide-react';
import { ClipboardCheck, LayoutDashboard, MessageSquareWarning, Plane, UserRound, UserPlus } from 'lucide-react';

export type WardenNavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  hint?: string;
};

export const wardenNavLinks: WardenNavLink[] = [
  { href: '/warden', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/warden/attendance', label: 'Attendance', icon: ClipboardCheck, hint: 'Night roll call' },
  { href: '/warden/complaints', label: 'Complaints', icon: MessageSquareWarning, hint: 'Maintenance desk' },
  { href: '/warden/leave', label: 'Leave', icon: Plane, hint: 'Approvals queue' },
  { href: '/warden/students', label: 'Residents', icon: UserRound },
  { href: '/warden/visitors', label: 'Visitors', icon: UserPlus, hint: 'Gate desk' },
];
