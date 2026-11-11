import type { StaffDutyRole } from '@/components/dashboard/staff-portal/staff-nav-permissions';
import { STAFF_ROLE_LABELS } from '@/components/dashboard/staff-portal/staff-nav-permissions';

export type StaffShiftState = 'on_duty' | 'upcoming' | 'off_duty' | 'on_break' | 'completed';

export type StaffShiftDisplay = {
  state: StaffShiftState;
  label: string;
  timeWindow: string;
};

export const STAFF_DEMO_WORKPLACE = 'Sunrise Boys Hostel';

export const STAFF_SHIFT_BY_ROLE: Record<StaffDutyRole, StaffShiftDisplay> = {
  security_guard: { state: 'on_duty', label: 'On Duty', timeWindow: '08:00 AM – 04:00 PM' },
  housekeeping: { state: 'on_duty', label: 'On Duty', timeWindow: '07:00 AM – 03:00 PM' },
  maintenance: { state: 'upcoming', label: 'Upcoming Shift', timeWindow: '02:00 PM – 10:00 PM' },
  receptionist: { state: 'on_duty', label: 'On Duty', timeWindow: '09:00 AM – 05:00 PM' },
  mess_staff: { state: 'on_break', label: 'On Break', timeWindow: '12:30 PM – 01:00 PM' },
};

export function getStaffShiftDisplay(role: StaffDutyRole): StaffShiftDisplay {
  return STAFF_SHIFT_BY_ROLE[role] ?? STAFF_SHIFT_BY_ROLE.security_guard;
}

export type StaffSearchHit = {
  id: string;
  label: string;
  hint: string;
  href: string;
  category: string;
};

export const SAMPLE_STAFF_SEARCH_HITS: StaffSearchHit[] = [
  { id: 't1', label: 'Lobby deep clean', hint: 'Housekeeping · due today', href: '/staff/tasks', category: 'Tasks' },
  { id: 'v1', label: 'Visitor: Arjun Mehta', hint: 'Gate pass pending', href: '/staff/visitors', category: 'Visitors' },
  { id: 'a1', label: 'Water shutdown notice', hint: 'Block B · 6 PM', href: '/staff/announcements', category: 'Notices' },
  { id: 'm1', label: 'Repair #MT-204', hint: 'Ceiling fan · Room A-210', href: '/staff/maintenance', category: 'Maintenance' },
];

export function staffRoleShortLabel(role: StaffDutyRole): string {
  return STAFF_ROLE_LABELS[role];
}

export type StaffMessage = {
  id: string;
  from: string;
  preview: string;
  time: string;
  unread: boolean;
};

export const SAMPLE_STAFF_MESSAGES: StaffMessage[] = [
  {
    id: 'm1',
    from: 'Hostel Warden',
    preview: 'Please verify visitor gate logs before evening shift.',
    time: '12m ago',
    unread: true,
  },
  {
    id: 'm2',
    from: 'Admin Desk',
    preview: 'Maintenance ticket #MT-204 assigned to your roster.',
    time: '45m ago',
    unread: true,
  },
  {
    id: 'm3',
    from: 'Security Lead',
    preview: 'Briefing at 3:30 PM — main lobby.',
    time: '2h ago',
    unread: false,
  },
];

export const STAFF_DUTY_ROLE_STORAGE_KEY = 'nestora-staff-duty-role-demo';
