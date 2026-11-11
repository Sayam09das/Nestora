'use client';

import { useMemo } from 'react';

import {
  buildStaffDashboardSnapshot,
  buildStaffQuickActions,
} from '@/components/dashboard/staff-portal/home/staff-dashboard-data';
import { StaffDashboardAnnouncementsPanel } from '@/components/dashboard/staff-portal/home/staff-dashboard-announcements-panel';
import { StaffDashboardAttendancePanel } from '@/components/dashboard/staff-portal/home/staff-dashboard-attendance-panel';
import { StaffDashboardKpiStrip } from '@/components/dashboard/staff-portal/home/staff-dashboard-kpi-strip';
import { StaffDashboardProgressPanel } from '@/components/dashboard/staff-portal/home/staff-dashboard-progress-panel';
import { StaffDashboardQuickActions } from '@/components/dashboard/staff-portal/home/staff-dashboard-quick-actions';
import { StaffDashboardShiftPanel } from '@/components/dashboard/staff-portal/home/staff-dashboard-shift-panel';
import { StaffDashboardTasksPanel } from '@/components/dashboard/staff-portal/home/staff-dashboard-tasks-panel';
import { StaffDashboardWelcome } from '@/components/dashboard/staff-portal/home/staff-dashboard-welcome';
import { useStaffShell } from '@/components/dashboard/staff-portal/staff-shell-provider';
import { STAFF_DEMO_WORKPLACE } from '@/components/dashboard/staff-portal/staff-topbar-data';

export function StaffDashboardHome() {
  const { dutyRole, displayName, workplaceName, shift } = useStaffShell();

  const snapshot = useMemo(
    () =>
      buildStaffDashboardSnapshot(
        dutyRole,
        workplaceName || STAFF_DEMO_WORKPLACE,
        shift,
      ),
    [dutyRole, workplaceName, shift],
  );

  const quickActions = useMemo(() => buildStaffQuickActions(dutyRole), [dutyRole]);

  return (
    <div className="space-y-6 pb-4 lg:space-y-8">
      <StaffDashboardWelcome snapshot={snapshot} displayName={displayName} roleFocus={snapshot.roleFocus} />
      <StaffDashboardKpiStrip snapshot={snapshot} />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <StaffDashboardShiftPanel snapshot={snapshot} />
        </div>
        <div className="lg:col-span-5">
          <StaffDashboardProgressPanel snapshot={snapshot} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <StaffDashboardTasksPanel snapshot={snapshot} />
        </div>
        <div className="lg:col-span-5">
          <StaffDashboardAttendancePanel snapshot={snapshot} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <StaffDashboardAnnouncementsPanel snapshot={snapshot} />
        </div>
        <div className="lg:col-span-5">
          <StaffDashboardQuickActions actions={quickActions} />
        </div>
      </div>
    </div>
  );
}
