import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  BedDouble,
  Building2,
  CalendarOff,
  ClipboardCheck,
  CreditCard,
  FileText,
  LayoutDashboard,
  LayoutGrid,
  Megaphone,
  MessageSquareWarning,
  Settings,
  Shield,
  UserCog,
  Users,
} from 'lucide-react';

export type AdminNavChild = {
  href: string;
  label: string;
  isActive: (pathname: string) => boolean;
};

export type AdminNavLink = {
  kind: 'link';
  id: string;
  href: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
};

export type AdminNavCollapsible = {
  kind: 'collapsible';
  id: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  children: AdminNavChild[];
  isActive: (pathname: string) => boolean;
};

export type AdminNavEntry = AdminNavLink | AdminNavCollapsible;

export type AdminNavGroup = {
  id: string;
  label: string;
  items: AdminNavEntry[];
};

const pathStarts =
  (base: string) =>
  (pathname: string): boolean =>
    pathname === base || pathname.startsWith(`${base}/`);

export const adminNavGroups: AdminNavGroup[] = [
  {
    id: 'main',
    label: 'Main Menu',
    items: [
      {
        kind: 'link',
        id: 'dashboard',
        href: '/admin',
        label: 'Dashboard',
        description: 'Campus overview',
        icon: LayoutDashboard,
        isActive: (pathname) => pathname === '/admin',
      },
      {
        kind: 'collapsible',
        id: 'students',
        label: 'Students',
        description: 'Enrollment & requests',
        icon: Users,
        isActive: pathStarts('/admin/students'),
        children: [
          {
            href: '/admin/students',
            label: 'All Students',
            isActive: (p) => p === '/admin/students',
          },
          {
            href: '/admin/students/new',
            label: 'Add Student',
            isActive: (p) => p === '/admin/students/new',
          },
          {
            href: '/admin/students/requests',
            label: 'Student Requests',
            isActive: pathStarts('/admin/students/requests'),
          },
        ],
      },
      {
        kind: 'collapsible',
        id: 'staff',
        label: 'Staff & Wardens',
        description: 'Housing teams',
        icon: UserCog,
        isActive: pathStarts('/admin/staff'),
        children: [
          {
            href: '/admin/staff',
            label: 'All Staff',
            isActive: (p) => p === '/admin/staff',
          },
          {
            href: '/admin/staff/wardens',
            label: 'Wardens',
            isActive: pathStarts('/admin/staff/wardens'),
          },
          {
            href: '/admin/staff/new',
            label: 'Add Staff Member',
            isActive: (p) => p === '/admin/staff/new',
          },
        ],
      },
      {
        kind: 'collapsible',
        id: 'rooms',
        label: 'Room Management',
        description: 'Beds & inventory',
        icon: BedDouble,
        isActive: pathStarts('/admin/rooms'),
        children: [
          {
            href: '/admin/rooms',
            label: 'All Rooms',
            isActive: (p) => p === '/admin/rooms',
          },
          {
            href: '/admin/rooms/beds',
            label: 'Bed Inventory',
            isActive: pathStarts('/admin/rooms/beds'),
          },
          {
            href: '/admin/rooms/types',
            label: 'Room Types',
            isActive: pathStarts('/admin/rooms/types'),
          },
        ],
      },
      {
        kind: 'collapsible',
        id: 'hostels',
        label: 'Hostel Management',
        description: 'Buildings & blocks',
        icon: Building2,
        isActive: pathStarts('/admin/hostels'),
        children: [
          {
            href: '/admin/hostels',
            label: 'All Hostels',
            isActive: (p) => p === '/admin/hostels',
          },
        ],
      },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    items: [
      {
        kind: 'collapsible',
        id: 'allocation',
        label: 'Room Allocation',
        description: 'Beds & assignments',
        icon: LayoutGrid,
        isActive: pathStarts('/admin/allocation'),
        children: [
          {
            href: '/admin/allocation',
            label: 'Allocation Center',
            isActive: (p) => p === '/admin/allocation',
          },
        ],
      },
      {
        kind: 'collapsible',
        id: 'attendance',
        label: 'Attendance',
        description: 'Night roll call',
        icon: ClipboardCheck,
        isActive: pathStarts('/admin/attendance'),
        children: [
          {
            href: '/admin/attendance',
            label: 'Mark Attendance',
            isActive: (p) => p === '/admin/attendance',
          },
        ],
      },
      {
        kind: 'link',
        id: 'fees',
        href: '/admin/fees',
        label: 'Fees & Payments',
        icon: CreditCard,
        isActive: pathStarts('/admin/fees'),
      },
      {
        kind: 'collapsible',
        id: 'complaints',
        label: 'Complaints',
        description: 'Maintenance tickets',
        icon: MessageSquareWarning,
        isActive: pathStarts('/admin/complaints'),
        children: [
          {
            href: '/admin/complaints',
            label: 'Ticket board',
            isActive: (p) => p === '/admin/complaints' || p.startsWith('/admin/complaints/'),
          },
        ],
      },
      {
        kind: 'collapsible',
        id: 'leave',
        label: 'Leave Requests',
        description: 'Approvals & gate passes',
        icon: CalendarOff,
        isActive: pathStarts('/admin/leave'),
        children: [
          {
            href: '/admin/leave',
            label: 'Warden desk',
            isActive: (p) => p === '/admin/leave' || p.startsWith('/admin/leave/'),
          },
        ],
      },
      {
        kind: 'link',
        id: 'announcements',
        href: '/admin/announcements',
        label: 'Announcements',
        icon: Megaphone,
        isActive: pathStarts('/admin/announcements'),
      },
    ],
  },
  {
    id: 'insights',
    label: 'Insights',
    items: [
      {
        kind: 'link',
        id: 'reports',
        href: '/admin/reports',
        label: 'Reports & Analytics',
        icon: BarChart3,
        isActive: pathStarts('/admin/reports'),
      },
    ],
  },
  {
    id: 'system',
    label: 'System',
    items: [
      {
        kind: 'link',
        id: 'settings',
        href: '/admin/settings',
        label: 'Settings',
        icon: Settings,
        isActive: pathStarts('/admin/settings'),
      },
      {
        kind: 'link',
        id: 'roles',
        href: '/admin/roles',
        label: 'Roles & Permissions',
        icon: Shield,
        isActive: pathStarts('/admin/roles'),
      },
      {
        kind: 'link',
        id: 'activity-logs',
        href: '/admin/audit-logs',
        label: 'Activity Logs',
        icon: FileText,
        isActive: (pathname) => pathname.startsWith('/admin/audit-logs'),
      },
    ],
  },
];

/** Flat links for command palette / search */
export function flattenAdminNavLinks(): Array<{
  href: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  group: string;
}> {
  const out: Array<{
    href: string;
    label: string;
    hint: string;
    icon: LucideIcon;
    group: string;
  }> = [];

  for (const group of adminNavGroups) {
    for (const item of group.items) {
      if (item.kind === 'link') {
        out.push({
          href: item.href,
          label: item.label,
          hint: item.description ?? group.label,
          icon: item.icon,
          group: group.label,
        });
      } else {
        for (const child of item.children) {
          out.push({
            href: child.href,
            label: child.label,
            hint: item.label,
            icon: item.icon,
            group: group.label,
          });
        }
      }
    }
  }

  return out;
}

export function findAdminNavTitle(pathname: string): string | null {
  for (const group of adminNavGroups) {
    for (const item of group.items) {
      if (item.kind === 'link' && item.isActive(pathname)) {
        return item.label;
      }
      if (item.kind === 'collapsible') {
        for (const child of item.children) {
          if (child.isActive(pathname)) {
            return child.label;
          }
        }
        if (item.isActive(pathname)) {
          return item.label;
        }
      }
    }
  }
  return null;
}

/** @deprecated Use adminNavGroups — kept for any legacy imports */
export const adminNavItems = flattenAdminNavLinks().map((link) => ({
  href: link.href,
  label: link.label,
  description: link.hint,
  icon: link.icon,
  isActive: (pathname: string) =>
    pathname === link.href || pathname.startsWith(`${link.href}/`),
}));
