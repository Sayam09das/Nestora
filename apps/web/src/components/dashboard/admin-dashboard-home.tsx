'use client';

import { AdminDashboardAnalyticsRow } from '@/components/dashboard/admin-dashboard-analytics-row';
import { AdminDashboardFootnote } from '@/components/dashboard/admin-dashboard-footnote';
import { AdminDashboardInsightsRow } from '@/components/dashboard/admin-dashboard-insights-row';
import { AdminDashboardOperationsBento } from '@/components/dashboard/admin-dashboard-operations-bento';
import { AdminDashboardSignalsRow } from '@/components/dashboard/admin-dashboard-signals-row';
import { AdminDashboardStatsStrip } from '@/components/dashboard/admin-dashboard-stats-strip';
import { AdminDashboardWelcome } from '@/components/dashboard/admin-dashboard-welcome';

export function AdminDashboardHome() {
  const occupancy = 80.6;

  return (
    <div className="space-y-8 pb-4">
      <AdminDashboardWelcome />
      <AdminDashboardStatsStrip />
      <AdminDashboardOperationsBento occupancyPercent={occupancy} />
      <AdminDashboardSignalsRow />
      <AdminDashboardInsightsRow />
      <AdminDashboardAnalyticsRow />
      <AdminDashboardFootnote />
    </div>
  );
}
