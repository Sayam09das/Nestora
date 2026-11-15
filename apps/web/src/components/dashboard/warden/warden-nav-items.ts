import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  BedDouble,
  CalendarDays,
  ClipboardCheck,
  DoorOpen,
  ClipboardList,
  FileWarning,
  LayoutDashboard,
  Megaphone,
  MessageSquareWarning,
  Plane,
  Settings,
  UserCog,
  UserPlus,
  Users,
  Wrench,
} from 'lucide-react';

import type { WardenNavPermission } from '@/components/dashboard/warden/warden-nav-permissions';
import { wardenCanAccess } from '@/components/dashboard/warden/warden-nav-permissions';

export type WardenNavLink = {
  kind: 'link';
  id: string;
  href: string;
  label: string;
  description?: string;
  hint?: string;
  icon: LucideIcon;
  permission: WardenNavPermission;
  isActive: (pathname: string) => boolean;
};

export type WardenNavGroup = {
  id: string;
  label: string;
  items: WardenNavLink[];
};

function pathActive(href: string): (pathname: string) => boolean {
  return (pathname) => {
    if (href === '/warden') return pathname === '/warden';
    return pathname === href || pathname.startsWith(`${href}/`);
  };
}

const workspace: WardenNavGroup = {
  id: 'workspace',
  label: 'Workspace',
  items: [
    {
      kind: 'link',
      id: 'dashboard',
      href: '/warden',
      label: 'Dashboard',
      icon: LayoutDashboard,
      permission: 'workspace.dashboard',
      isActive: pathActive('/warden'),
    },
    {
      kind: 'link',
      id: 'students',
      href: '/warden/students',
      label: 'Student Management',
      description: 'Residents, details, room allocations',
      icon: Users,
      permission: 'workspace.students',
      isActive: pathActive('/warden/students'),
    },
    {
      kind: 'link',
      id: 'checkout',
      href: '/warden/checkout',
      label: 'Check-out queue',
      description: 'Planned vacate and bed release',
      icon: DoorOpen,
      permission: 'workspace.students',
      isActive: pathActive('/warden/checkout'),
    },
    {
      kind: 'link',
      id: 'rooms',
      href: '/warden/rooms',
      label: 'Room & Bed Management',
      description: 'Occupancy, beds, room changes',
      icon: BedDouble,
      permission: 'workspace.rooms',
      isActive: pathActive('/warden/rooms'),
    },
    {
      kind: 'link',
      id: 'attendance',
      href: '/warden/attendance',
      label: 'Attendance',
      description: 'Daily roll call and absentees',
      icon: ClipboardCheck,
      permission: 'workspace.attendance',
      isActive: pathActive('/warden/attendance'),
    },
    {
      kind: 'link',
      id: 'leave',
      href: '/warden/leave',
      label: 'Leave Requests',
      description: 'Approve or reject student leave',
      icon: Plane,
      permission: 'workspace.leave',
      isActive: pathActive('/warden/leave'),
    },
    {
      kind: 'link',
      id: 'outings',
      href: '/warden/outings',
      label: 'Outings',
      description: 'Same-day outing approvals (MOD-08)',
      icon: CalendarDays,
      permission: 'workspace.leave',
      isActive: pathActive('/warden/outings'),
    },
    {
      kind: 'link',
      id: 'visitors',
      href: '/warden/visitors',
      label: 'Visitor Management',
      description: 'Gate entries and exits',
      icon: UserPlus,
      permission: 'workspace.visitors',
      isActive: pathActive('/warden/visitors'),
    },
  ],
};

const operations: WardenNavGroup = {
  id: 'operations',
  label: 'Hostel Operations',
  items: [
    {
      kind: 'link',
      id: 'complaints',
      href: '/warden/complaints',
      label: 'Complaints & Issues',
      icon: MessageSquareWarning,
      permission: 'operations.complaints',
      isActive: pathActive('/warden/complaints'),
    },
    {
      kind: 'link',
      id: 'maintenance',
      href: '/warden/maintenance',
      label: 'Maintenance Requests',
      icon: Wrench,
      permission: 'operations.maintenance',
      isActive: pathActive('/warden/maintenance'),
    },
    {
      kind: 'link',
      id: 'incidents',
      href: '/warden/incidents',
      label: 'Incident Reports',
      icon: FileWarning,
      permission: 'operations.incidents',
      isActive: pathActive('/warden/incidents'),
    },
    {
      kind: 'link',
      id: 'events',
      href: '/warden/events',
      label: 'Events & Activities',
      icon: CalendarDays,
      permission: 'operations.events',
      isActive: pathActive('/warden/events'),
    },
    {
      kind: 'link',
      id: 'announcements',
      href: '/warden/announcements',
      label: 'Announcements',
      icon: Megaphone,
      permission: 'operations.announcements',
      isActive: pathActive('/warden/announcements'),
    },
  ],
};

const account: WardenNavGroup = {
  id: 'account',
  label: 'Reports & Account',
  items: [
    {
      kind: 'link',
      id: 'reports',
      href: '/warden/reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      permission: 'account.reports',
      isActive: pathActive('/warden/reports'),
    },
    {
      kind: 'link',
      id: 'register',
      href: '/warden/register',
      label: 'Daily Register',
      icon: ClipboardList,
      permission: 'account.register',
      isActive: pathActive('/warden/register'),
    },
    {
      kind: 'link',
      id: 'profile',
      href: '/warden/profile',
      label: 'My Profile',
      icon: UserCog,
      permission: 'account.profile',
      isActive: pathActive('/warden/profile'),
    },
    {
      kind: 'link',
      id: 'settings',
      href: '/warden/settings',
      label: 'Settings',
      description: 'Warden preferences for this hostel',
      icon: Settings,
      permission: 'account.settings',
      isActive: pathActive('/warden/settings'),
    },
  ],
};

export const wardenNavGroups: WardenNavGroup[] = [workspace, operations, account];

export function filterWardenNavGroups(
  groups: WardenNavGroup[],
  allowed: ReadonlySet<WardenNavPermission>,
): WardenNavGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => wardenCanAccess(allowed, item.permission)),
    }))
    .filter((group) => group.items.length > 0);
}

export function flattenWardenNavLinks(groups: WardenNavGroup[]): WardenNavLink[] {
  return groups.flatMap((g) => g.items);
}

/** @deprecated Use flattenWardenNavLinks(filterWardenNavGroups(...)) */
export const wardenNavLinks = flattenWardenNavLinks(wardenNavGroups);
