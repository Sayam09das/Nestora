'use client';

import { OperationalDashboardHome } from '@/components/dashboard/operational-dashboard-home';
import { useOperationalDashboardOverview } from '@/hooks/use-operational-dashboard-overview';

export function StaffDashboardHome() {
  const session = useOperationalDashboardOverview('HOSTEL_STAFF');
  return <OperationalDashboardHome role="HOSTEL_STAFF" session={session} />;
}
