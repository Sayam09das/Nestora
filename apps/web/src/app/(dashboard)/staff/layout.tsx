import type { ReactNode } from 'react';

import { RoleDashboardShell } from '@/components/dashboard/role-dashboard-shell';

export default function StaffDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <RoleDashboardShell
      role="HOSTEL_STAFF"
      title="Hostel Staff"
      subtitle="Duty overview"
      homePath="/staff"
    >
      {children}
    </RoleDashboardShell>
  );
}
