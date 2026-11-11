import {
  AlertCircle,
  Boxes,
  CalendarClock,
  ClipboardCheck,
  ClipboardList,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Settings,
  Shield,
  UserCog,
  UtensilsCrossed,
  Wrench,
} from 'lucide-react';

import {
  staffCanAccess,
  type StaffNavPermission,
} from '@/components/dashboard/staff-portal/staff-nav-permissions';
import type { StaffNavGroup } from '@/components/dashboard/staff-portal/staff-nav-types';

export type { StaffNavLink, StaffNavGroup } from '@/components/dashboard/staff-portal/staff-nav-types';

function pathActive(href: string): (pathname: string) => boolean {
  return (pathname) => {
    if (href === '/staff') return pathname === '/staff';
    return pathname === href || pathname.startsWith(`${href}/`);
  };
}

const workspace: StaffNavGroup = {
  id: 'workspace',
  label: 'Workspace',
  items: [
    {
      id: 'dashboard',
      href: '/staff',
      label: 'Dashboard',
      description: 'Daily work overview',
      icon: LayoutDashboard,
      permission: 'workspace.dashboard',
      isActive: pathActive('/staff'),
    },
    {
      id: 'tasks',
      href: '/staff/tasks',
      label: 'My Assigned Tasks',
      description: 'Update progress & complete',
      icon: ClipboardList,
      permission: 'workspace.tasks',
      isActive: pathActive('/staff/tasks'),
    },
    {
      id: 'schedule',
      href: '/staff/schedule',
      label: 'My Schedule',
      description: 'Daily & weekly roster',
      icon: CalendarClock,
      permission: 'workspace.schedule',
      isActive: pathActive('/staff/schedule'),
    },
    {
      id: 'attendance',
      href: '/staff/attendance',
      label: 'Attendance & Shifts',
      description: 'Check-in & shift records',
      icon: ClipboardCheck,
      permission: 'workspace.attendance',
      isActive: pathActive('/staff/attendance'),
    },
  ],
};

const operations: StaffNavGroup = {
  id: 'operations',
  label: 'Daily Operations',
  items: [
    {
      id: 'visitors',
      href: '/staff/visitors',
      label: 'Visitor & Security Log',
      icon: Shield,
      permission: 'ops.visitors',
      isActive: pathActive('/staff/visitors'),
    },
    {
      id: 'maintenance',
      href: '/staff/maintenance',
      label: 'Maintenance Tasks',
      icon: Wrench,
      permission: 'ops.maintenance',
      isActive: pathActive('/staff/maintenance'),
    },
    {
      id: 'housekeeping',
      href: '/staff/housekeeping',
      label: 'Housekeeping Tasks',
      icon: ClipboardList,
      permission: 'ops.housekeeping',
      isActive: pathActive('/staff/housekeeping'),
    },
    {
      id: 'mess',
      href: '/staff/mess',
      label: 'Mess Operations',
      icon: UtensilsCrossed,
      permission: 'ops.mess',
      isActive: pathActive('/staff/mess'),
    },
    {
      id: 'inventory',
      href: '/staff/inventory',
      label: 'Inventory & Supplies',
      icon: Boxes,
      permission: 'ops.inventory',
      isActive: pathActive('/staff/inventory'),
    },
  ],
};

const communication: StaffNavGroup = {
  id: 'communication',
  label: 'Communication',
  items: [
    {
      id: 'announcements',
      href: '/staff/announcements',
      label: 'Announcements',
      icon: Megaphone,
      permission: 'comms.announcements',
      isActive: pathActive('/staff/announcements'),
    },
    {
      id: 'messages',
      href: '/staff/messages',
      label: 'Messages',
      icon: MessageSquare,
      permission: 'comms.messages',
      isActive: pathActive('/staff/messages'),
    },
    {
      id: 'report',
      href: '/staff/report',
      label: 'Report an Issue',
      icon: AlertCircle,
      permission: 'comms.report',
      isActive: pathActive('/staff/report'),
    },
  ],
};

const account: StaffNavGroup = {
  id: 'account',
  label: 'Account',
  items: [
    {
      id: 'profile',
      href: '/staff/profile',
      label: 'My Profile',
      icon: UserCog,
      permission: 'account.profile',
      isActive: pathActive('/staff/profile'),
    },
    {
      id: 'settings',
      href: '/staff/settings',
      label: 'Settings',
      icon: Settings,
      permission: 'account.settings',
      isActive: pathActive('/staff/settings'),
    },
  ],
};

export const staffNavGroups: StaffNavGroup[] = [workspace, operations, communication, account];

export function filterStaffNavGroups(
  groups: StaffNavGroup[],
  allowed: ReadonlySet<StaffNavPermission>,
): StaffNavGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => staffCanAccess(allowed, item.permission)),
    }))
    .filter((group) => group.items.length > 0);
}

export function flattenStaffNavLinks(groups: StaffNavGroup[]) {
  return groups.flatMap((g) => g.items);
}
