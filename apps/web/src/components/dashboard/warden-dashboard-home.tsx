'use client';

import { OperationalDashboardHome } from '@/components/dashboard/operational-dashboard-home';
import { useOperationalDashboardOverview } from '@/hooks/use-operational-dashboard-overview';

export function WardenDashboardHome() {
  const session = useOperationalDashboardOverview('HOSTEL_WARDEN');
  return <OperationalDashboardHome role="HOSTEL_WARDEN" session={session} />;
}
