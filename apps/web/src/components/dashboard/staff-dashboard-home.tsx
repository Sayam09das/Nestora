'use client';

import { useMemo } from 'react';

import { buildStaffQuickActions } from '@/components/dashboard/staff-portal/home/staff-dashboard-data';
import { StaffDashboardAnnouncementsPanel } from '@/components/dashboard/staff-portal/home/staff-dashboard-announcements-panel';
import { StaffDashboardAttendancePanel } from '@/components/dashboard/staff-portal/home/staff-dashboard-attendance-panel';
import { StaffDashboardFootnote } from '@/components/dashboard/staff-portal/home/staff-dashboard-footnote';
import { StaffDashboardKpiStrip } from '@/components/dashboard/staff-portal/home/staff-dashboard-kpi-strip';
import { StaffDashboardLiveStatus } from '@/components/dashboard/staff-portal/home/staff-dashboard-live-status';
import { StaffDashboardProgressPanel } from '@/components/dashboard/staff-portal/home/staff-dashboard-progress-panel';
import { StaffDashboardQuickActions } from '@/components/dashboard/staff-portal/home/staff-dashboard-quick-actions';
import { StaffDashboardShiftPanel } from '@/components/dashboard/staff-portal/home/staff-dashboard-shift-panel';
import { StaffDashboardTasksPanel } from '@/components/dashboard/staff-portal/home/staff-dashboard-tasks-panel';
import { StaffDashboardWelcome } from '@/components/dashboard/staff-portal/home/staff-dashboard-welcome';
import { useStaffShell } from '@/components/dashboard/staff-portal/staff-shell-provider';
import { useStaffDashboardDesk } from '@/hooks/use-staff-dashboard-desk';

export function StaffDashboardHome() {
  const { dutyRole, displayName, workplaceName, shift } = useStaffShell();
  const desk = useStaffDashboardDesk({ dutyRole, displayName, workplaceName, shift });

  const quickActions = useMemo(() => buildStaffQuickActions(dutyRole), [dutyRole]);

  return (
    <div className="space-y-6 pb-4 lg:space-y-8">
      <StaffDashboardWelcome
        snapshot={desk.snapshot}
        displayName={displayName}
        roleFocus={desk.snapshot.roleFocus}
      />
      <StaffDashboardLiveStatus
        loading={desk.loading}
        error={desk.error}
        refresh={desk.refresh}
        hasOverview={desk.overview != null}
      />
      <StaffDashboardKpiStrip snapshot={desk.snapshot} loading={desk.loading && !desk.snapshot.liveMetrics} />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <StaffDashboardShiftPanel snapshot={desk.snapshot} />
        </div>
        <div className="lg:col-span-5">
          <StaffDashboardProgressPanel snapshot={desk.snapshot} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <StaffDashboardTasksPanel snapshot={desk.snapshot} />
        </div>
        <div className="lg:col-span-5">
          <StaffDashboardAttendancePanel snapshot={desk.snapshot} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <StaffDashboardAnnouncementsPanel snapshot={desk.snapshot} />
        </div>
        <div className="lg:col-span-5">
          <StaffDashboardQuickActions actions={quickActions} />
        </div>
      </div>

      <StaffDashboardFootnote liveMetrics={Boolean(desk.snapshot.liveMetrics)} overview={desk.overview} />
    </div>
  );
}