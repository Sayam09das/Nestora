import type { ReactNode } from 'react';

import { AccountantDashboardShell } from '@/components/dashboard/accountant-portal/accountant-dashboard-shell';

export default function AccountantDashboardLayout({ children }: { children: ReactNode }) {
  return <AccountantDashboardShell>{children}</AccountantDashboardShell>;
}