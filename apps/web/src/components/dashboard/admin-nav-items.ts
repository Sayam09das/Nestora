import type { LucideIcon } from 'lucide-react';
import { FileText, LayoutDashboard } from 'lucide-react';

export type AdminNavItem = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
};

export const adminNavItems: AdminNavItem[] = [
  {
    href: '/admin',
    label: 'Overview',
    description: 'Campus posture & shortcuts',
    icon: LayoutDashboard,
    isActive: (pathname) => pathname === '/admin',
  },
  {
    href: '/admin/audit-logs',
    label: 'Audit logs',
    description: 'Immutable security trail',
    icon: FileText,
    isActive: (pathname) => pathname.startsWith('/admin/audit-logs'),
  },
];
