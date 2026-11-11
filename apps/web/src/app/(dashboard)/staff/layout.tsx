import type { ReactNode } from 'react';

import { StaffDashboardShell } from '@/components/dashboard/staff-portal/staff-dashboard-shell';

export default function StaffDashboardLayout({ children }: { children: ReactNode }) {
  return <StaffDashboardShell>{children}</StaffDashboardShell>;
}
