import type { ReactNode } from 'react';

import { GuardDashboardShell } from '@/components/dashboard/guard-portal/guard-dashboard-shell';

export default function GuardDashboardLayout({ children }: { children: ReactNode }) {
  return <GuardDashboardShell>{children}</GuardDashboardShell>;
}