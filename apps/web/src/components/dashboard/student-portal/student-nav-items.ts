import {
  BedDouble,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  MessageCircle,
  MessageSquareWarning,
  PartyPopper,
  QrCode,
  Phone,
  Settings,
  UserCircle,
  Users,
  Wrench,
  UserRoundPlus,
} from 'lucide-react';

import {
  studentCanAccess,
  type StudentNavPermission,
} from '@/components/dashboard/student-portal/student-nav-permissions';
import type { StudentNavGroup, StudentNavLink } from '@/components/dashboard/student-portal/student-nav-types';

export type { StudentNavLink, StudentNavGroup } from '@/components/dashboard/student-portal/student-nav-types';

function pathActive(href: string): (pathname: string) => boolean {
  return (pathname) => {
    if (href === '/student') return pathname === '/student';
    return pathname === href || pathname.startsWith(`${href}/`);
  };
}

const overview: StudentNavGroup = {
  id: 'overview',
  label: 'Overview',
  items: [
    {
      id: 'dashboard',
      href: '/student',
      label: 'Dashboard',
      description: 'Personal hostel overview',
      icon: LayoutDashboard,
      permission: 'overview.dashboard',
      isActive: pathActive('/student'),
    },
  ],
};

const myHostel: StudentNavGroup = {
  id: 'my-hostel',
  label: 'My Hostel',
  items: [
    {
      id: 'profile',
      href: '/student/profile',
      label: 'My Profile',
      icon: UserCircle,
      permission: 'hostel.profile',
      isActive: pathActive('/student/profile'),
    },
    {
      id: 'room',
      href: '/student/room',
      label: 'My Room & Bed',
      icon: BedDouble,
      permission: 'hostel.room',
      isActive: pathActive('/student/room'),
    },
    {
      id: 'attendance',
      href: '/student/attendance',
      label: 'My Attendance',
      icon: CalendarCheck,
      permission: 'hostel.attendance',
      isActive: pathActive('/student/attendance'),
    },
    {
      id: 'roommates',
      href: '/student/roommates',
      label: 'Roommates',
      icon: Users,
      permission: 'hostel.roommates',
      isActive: pathActive('/student/roommates'),
    },
  ],
};

const requests: StudentNavGroup = {
  id: 'requests',
  label: 'Requests & Services',
  items: [
    {
      id: 'leave',
      href: '/student/leave',
      label: 'Leave Requests',
      icon: CalendarDays,
      permission: 'services.leave',
      badgeKey: 'leave',
      isActive: pathActive('/student/leave'),
    },
    {
      id: 'outings',
      href: '/student/outings',
      label: 'Outings',
      icon: CalendarCheck,
      permission: 'services.outings',
      isActive: pathActive('/student/outings'),
    },
    {
      id: 'gate-passes',
      href: '/student/gate-passes',
      label: 'Gate Passes',
      icon: QrCode,
      permission: 'services.gatepasses',
      isActive: pathActive('/student/gate-passes'),
    },
    {
      id: 'complaints',
      href: '/student/complaints',
      label: 'Complaints',
      icon: MessageSquareWarning,
      permission: 'services.complaints',
      badgeKey: 'complaints',
      isActive: pathActive('/student/complaints'),
    },
    {
      id: 'maintenance',
      href: '/student/maintenance',
      label: 'Maintenance Requests',
      icon: Wrench,
      permission: 'services.maintenance',
      badgeKey: 'maintenance',
      isActive: pathActive('/student/maintenance'),
    },
    {
      id: 'visitors',
      href: '/student/visitors',
      label: 'Visitor Requests',
      icon: UserRoundPlus,
      permission: 'services.visitors',
      badgeKey: 'visitors',
      isActive: pathActive('/student/visitors'),
    },
    {
      id: 'fees',
      href: '/student/fees',
      label: 'Fee & Payments',
      icon: CreditCard,
      permission: 'services.fees',
      badgeKey: 'fees',
      isActive: pathActive('/student/fees'),
    },
  ],
};

const information: StudentNavGroup = {
  id: 'information',
  label: 'Information',
  items: [
    {
      id: 'announcements',
      href: '/student/announcements',
      label: 'Announcements',
      icon: Megaphone,
      permission: 'info.announcements',
      badgeKey: 'announcements',
      isActive: pathActive('/student/announcements'),
    },
    {
      id: 'messages',
      href: '/student/messages',
      label: 'Messages',
      icon: MessageCircle,
      permission: 'info.messages',
      isActive: pathActive('/student/messages'),
    },
    {
      id: 'events',
      href: '/student/events',
      label: 'Events & Activities',
      icon: PartyPopper,
      permission: 'info.events',
      isActive: pathActive('/student/events'),
    },
    {
      id: 'rules',
      href: '/student/rules',
      label: 'Hostel Rules & Policies',
      icon: BookOpen,
      permission: 'info.rules',
      isActive: pathActive('/student/rules'),
    },
    {
      id: 'emergency',
      href: '/student/emergency',
      label: 'Emergency Contacts',
      icon: Phone,
      permission: 'info.emergency',
      isActive: pathActive('/student/emergency'),
    },
  ],
};

const account: StudentNavGroup = {
  id: 'account',
  label: 'Account',
  items: [
    {
      id: 'settings',
      href: '/student/settings',
      label: 'Settings',
      icon: Settings,
      permission: 'account.settings',
      isActive: pathActive('/student/settings'),
    },
    {
      id: 'help',
      href: '/student/help',
      label: 'Help & Support',
      icon: LifeBuoy,
      permission: 'account.help',
      isActive: pathActive('/student/help'),
    },
  ],
};

export const studentNavGroups: StudentNavGroup[] = [overview, myHostel, requests, information, account];

export function filterStudentNavGroups(
  groups: StudentNavGroup[],
  allowed: ReadonlySet<StudentNavPermission>,
): StudentNavGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => studentCanAccess(allowed, item.permission)),
    }))
    .filter((group) => group.items.length > 0);
}

export function flattenStudentNavLinks(groups: StudentNavGroup[]): StudentNavLink[] {
  return groups.flatMap((g) => g.items);
}
