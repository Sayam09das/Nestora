import type { LucideIcon } from 'lucide-react';

import type { StudentNavBadgeKey, StudentNavPermission } from '@/components/dashboard/student-portal/student-nav-permissions';

export type StudentNavLink = {
  id: string;
  href: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  permission: StudentNavPermission;
  badgeKey?: StudentNavBadgeKey;
  isActive: (pathname: string) => boolean;
};

export type StudentNavGroup = {
  id: string;
  label: string;
  items: StudentNavLink[];
};
