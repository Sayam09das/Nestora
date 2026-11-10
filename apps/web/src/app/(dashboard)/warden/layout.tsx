import type { ReactNode } from 'react';

import { WardenDashboardShell } from '@/components/dashboard/warden/warden-dashboard-shell';

export default function WardenDashboardLayout({ children }: { children: ReactNode }) {
  return <WardenDashboardShell>{children}</WardenDashboardShell>;
}
