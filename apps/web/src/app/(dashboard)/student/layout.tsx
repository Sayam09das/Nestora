import type { ReactNode } from 'react';

import { StudentDashboardShell } from '@/components/dashboard/student-portal/student-dashboard-shell';

export default function StudentDashboardLayout({ children }: { children: ReactNode }) {
  return <StudentDashboardShell>{children}</StudentDashboardShell>;
}
