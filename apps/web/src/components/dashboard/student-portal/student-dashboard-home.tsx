'use client';

import { Loader2 } from 'lucide-react';
import { useMemo } from 'react';

import { STUDENT_QUICK_ACTIONS } from '@/components/dashboard/student-portal/home/student-dashboard-data';
import { StudentDashboardAnnouncementsPanel } from '@/components/dashboard/student-portal/home/student-dashboard-announcements-panel';
import { StudentDashboardAttendancePanel } from '@/components/dashboard/student-portal/home/student-dashboard-attendance-panel';
import { StudentDashboardComplaintsPanel } from '@/components/dashboard/student-portal/home/student-dashboard-complaints-panel';
import { StudentDashboardEventsPanel } from '@/components/dashboard/student-portal/home/student-dashboard-events-panel';
import { StudentDashboardFeesPanel } from '@/components/dashboard/student-portal/home/student-dashboard-fees-panel';
import { StudentDashboardKpiStrip } from '@/components/dashboard/student-portal/home/student-dashboard-kpi-strip';
import { StudentDashboardLeavePanel } from '@/components/dashboard/student-portal/home/student-dashboard-leave-panel';
import {
  emptyStudentDashboardSnapshot,
  mapOverviewToStudentSnapshot,
} from '@/components/dashboard/student-portal/home/student-dashboard-mapper';
import { StudentDashboardQuickActions } from '@/components/dashboard/student-portal/home/student-dashboard-quick-actions';
import { StudentDashboardRoomPanel } from '@/components/dashboard/student-portal/home/student-dashboard-room-panel';
import { StudentDashboardWelcome } from '@/components/dashboard/student-portal/home/student-dashboard-welcome';
import { useStudentShell } from '@/components/dashboard/student-portal/student-shell-provider';
import { useStudentDashboardOverview } from '@/hooks/use-student-dashboard-overview';
import { Button } from '@/components/ui/button';

function formatSyncedAt(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function StudentDashboardHome() {
  const { feesOnlineEnabled } = useStudentShell();
  const session = useStudentDashboardOverview();
  const { displayName, overview, loading, error, refresh } = session;

  const snapshot = useMemo(() => {
    if (overview) return mapOverviewToStudentSnapshot(overview);
    return emptyStudentDashboardSnapshot();
  }, [overview]);

  const quickActions = useMemo(
    () => STUDENT_QUICK_ACTIONS.filter((action) => !action.requiresFees || feesOnlineEnabled),
    [feesOnlineEnabled],
  );

  const isResident = overview?.residence.hasActiveAllocation === true;

  return (
    <div className="space-y-6 pb-4 lg:space-y-8">
      {error ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <span>{error}</span>
          <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={() => void refresh()}>
            Retry
          </Button>
        </div>
      ) : null}

      <StudentDashboardWelcome
        snapshot={snapshot}
        displayName={displayName}
        isResident={isResident}
        profileLinked={overview?.profile.linked ?? false}
        lastSyncedAt={overview ? formatSyncedAt(overview.generatedAt) : null}
        loading={loading && !overview}
      />
      <StudentDashboardKpiStrip snapshot={snapshot} showFees={feesOnlineEnabled} loading={loading && !overview} />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <StudentDashboardRoomPanel snapshot={snapshot} />
        </div>
        <div className="lg:col-span-5">
          <StudentDashboardAttendancePanel snapshot={snapshot} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className={feesOnlineEnabled ? 'lg:col-span-7' : 'lg:col-span-12'}>
          <StudentDashboardLeavePanel snapshot={snapshot} />
        </div>
        {feesOnlineEnabled ? (
          <div className="lg:col-span-5">
            <StudentDashboardFeesPanel snapshot={snapshot} />
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <StudentDashboardComplaintsPanel snapshot={snapshot} />
        </div>
        <div className="lg:col-span-5">
          <StudentDashboardAnnouncementsPanel snapshot={snapshot} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <StudentDashboardEventsPanel snapshot={snapshot} />
        </div>
        <div className="lg:col-span-5">
          <StudentDashboardQuickActions actions={quickActions} />
        </div>
      </div>

      {loading && !overview ? (
        <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Refreshing live metrics…
        </p>
      ) : overview ? (
        <p className="text-center text-xs text-muted-foreground">
          Counts refresh from your student profile every minute. Metrics synced {formatSyncedAt(overview.generatedAt)}.
        </p>
      ) : null}
    </div>
  );
}
