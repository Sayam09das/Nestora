import type { LucideIcon } from 'lucide-react';

import type { StaffNavPermission } from '@/components/dashboard/staff-portal/staff-nav-permissions';

export type StaffNavLink = {
  id: string;
  href: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  permission: StaffNavPermission;
  isActive: (pathname: string) => boolean;
};

export type StaffNavGroup = {
  id: string;
  label: string;
  items: StaffNavLink[];
};
