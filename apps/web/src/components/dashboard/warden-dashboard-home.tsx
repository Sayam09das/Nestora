'use client';

import { useMemo } from 'react';

import {
  createEmptyWardenSnapshot,
  mergeWardenSnapshotWithOverview,
} from '@/components/dashboard/warden/home/warden-dashboard-data';
import { WARDEN_ASSIGNED_HOSTELS } from '@/components/dashboard/warden/warden-topbar-data';
import { WardenDashboardAdmissionsQueue } from '@/components/dashboard/warden/home/warden-dashboard-admissions-queue';
import { WardenDashboardAttendancePanel } from '@/components/dashboard/warden/home/warden-dashboard-attendance-panel';
import { WardenDashboardFootnote } from '@/components/dashboard/warden/home/warden-dashboard-footnote';
import { WardenDashboardIncidentsPanel } from '@/components/dashboard/warden/home/warden-dashboard-incidents-panel';
import { WardenDashboardIssuesPanel } from '@/components/dashboard/warden/home/warden-dashboard-issues-panel';
import { WardenDashboardKpiStrip } from '@/components/dashboard/warden/home/warden-dashboard-kpi-strip';
import { WardenDashboardLiveStatus } from '@/components/dashboard/warden/home/warden-dashboard-live-status';
import { WardenDashboardPendingActions } from '@/components/dashboard/warden/home/warden-dashboard-pending-actions';
import { WardenDashboardQuickActionsBar } from '@/components/dashboard/warden/home/warden-dashboard-quick-actions-bar';
import { WardenDashboardVisitorsPanel } from '@/components/dashboard/warden/home/warden-dashboard-visitors-panel';
import { WardenDashboardWelcome } from '@/components/dashboard/warden/home/warden-dashboard-welcome';
import { useWardenShell } from '@/components/dashboard/warden/warden-shell-provider';
import { useOperationalDashboardOverview } from '@/hooks/use-operational-dashboard-overview';

export function WardenDashboardHome() {
  const session = useOperationalDashboardOverview('HOSTEL_WARDEN');
  const { selectedHostelId } = useWardenShell();

  const snapshot = useMemo(() => {
    const label =
      WARDEN_ASSIGNED_HOSTELS.find((h) => h.id === selectedHostelId)?.label ?? 'Assigned hostel';
    const base = createEmptyWardenSnapshot(label);
    return mergeWardenSnapshotWithOverview(base, session.overview);
  }, [selectedHostelId, session.overview]);

  return (
    <div className="space-y-6 pb-4 lg:space-y-8">
      <WardenDashboardWelcome
        snapshot={snapshot}
        displayName={session.displayName}
        metricsUpdatedAt={session.overview?.generatedAt}
      />
      <WardenDashboardLiveStatus
        loading={session.loading}
        error={session.error}
        refresh={session.refresh}
        overview={session.overview}
      />
      <WardenDashboardKpiStrip snapshot={snapshot} loading={session.loading && !snapshot.liveMetrics} />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <WardenDashboardAttendancePanel snapshot={snapshot} />
        </div>
        <div className="lg:col-span-5">
          <WardenDashboardPendingActions snapshot={snapshot} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <WardenDashboardAdmissionsQueue snapshot={snapshot} />
        </div>
        <div className="lg:col-span-5">
          <WardenDashboardIncidentsPanel snapshot={snapshot} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <WardenDashboardIssuesPanel snapshot={snapshot} />
        <WardenDashboardVisitorsPanel snapshot={snapshot} />
      </div>

      <WardenDashboardQuickActionsBar />
      <WardenDashboardFootnote liveMetrics={Boolean(snapshot.liveMetrics)} overview={session.overview} />
    </div>
  );
}
