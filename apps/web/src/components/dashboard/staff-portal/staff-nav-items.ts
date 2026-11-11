import type { LucideIcon } from 'lucide-react';
import { CalendarClock, ClipboardList, LayoutDashboard, Users, Wrench } from 'lucide-react';

export type StaffNavLink = {
  id: string;
  href: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
};

export type StaffNavGroup = {
  id: string;
  label: string;
  items: StaffNavLink[];
};

function pathActive(href: string): (pathname: string) => boolean {
  return (pathname) => {
    if (href === '/staff') return pathname === '/staff';
    return pathname === href || pathname.startsWith(`${href}/`);
  };
}

export const staffNavGroups: StaffNavGroup[] = [
  {
    id: 'workspace',
    label: 'Workspace',
    items: [
      {
        id: 'dashboard',
        href: '/staff',
        label: 'Dashboard',
        description: 'Duty overview & hostel scope',
        icon: LayoutDashboard,
        isActive: pathActive('/staff'),
      },
      {
        id: 'tickets',
        href: '/staff/tickets',
        label: 'My tickets',
        description: 'Assigned maintenance work',
        icon: Wrench,
        isActive: pathActive('/staff/tickets'),
      },
      {
        id: 'duties',
        href: '/staff/duties',
        label: 'Duties & shifts',
        description: "Today's roster and notes",
        icon: CalendarClock,
        isActive: pathActive('/staff/duties'),
      },
      {
        id: 'residents',
        href: '/staff/residents',
        label: 'Residents',
        description: 'Read-only student roster',
        icon: Users,
        isActive: pathActive('/staff/residents'),
      },
      {
        id: 'tasks',
        href: '/staff/tasks',
        label: 'Task log',
        description: 'Shift checklist (preview)',
        icon: ClipboardList,
        isActive: pathActive('/staff/tasks'),
      },
    ],
  },
];
