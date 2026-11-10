'use client';

import { AdminDashboardAnalyticsRow } from '@/components/dashboard/admin-dashboard-analytics-row';
import { AdminDashboardFootnote } from '@/components/dashboard/admin-dashboard-footnote';
import { AdminDashboardInsightsRow } from '@/components/dashboard/admin-dashboard-insights-row';
import { AdminDashboardOperationsBento } from '@/components/dashboard/admin-dashboard-operations-bento';
import { AdminDashboardSignalsRow } from '@/components/dashboard/admin-dashboard-signals-row';
import { AdminDashboardStatsStrip } from '@/components/dashboard/admin-dashboard-stats-strip';
import { AdminDashboardWelcome } from '@/components/dashboard/admin-dashboard-welcome';
import { useAdminDashboardOverview } from '@/hooks/use-admin-dashboard-overview';

export function AdminDashboardHome() {
  const session = useAdminDashboardOverview();

  return (
    <div className="space-y-8 pb-4">
      <AdminDashboardWelcome session={session} />
      <AdminDashboardStatsStrip overview={session.overview} loading={session.loading} />
      <AdminDashboardOperationsBento overview={session.overview} loading={session.loading} />
      <AdminDashboardSignalsRow overview={session.overview} loading={session.loading} />
      <AdminDashboardInsightsRow overview={session.overview} loading={session.loading} />
      <AdminDashboardAnalyticsRow overview={session.overview} loading={session.loading} />
      <AdminDashboardFootnote />
    </div>
  );
}
