import type { ReactNode } from 'react';

import { RoleDashboardShell } from '@/components/dashboard/role-dashboard-shell';

export default function WardenDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <RoleDashboardShell
      role="HOSTEL_WARDEN"
      title="Hostel Warden"
      subtitle="Operational overview"
      homePath="/warden"
    >
      {children}
    </RoleDashboardShell>
  );
}
