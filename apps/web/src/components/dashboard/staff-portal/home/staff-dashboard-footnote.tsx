'use client';

import type { OperationalDashboardOverview } from '@/lib/api/dashboard';

type Props = {
  liveMetrics: boolean;
  overview: OperationalDashboardOverview | null;
};

export function StaffDashboardFootnote({ liveMetrics, overview }: Props) {
  const generated = overview?.generatedAt
    ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(
        new Date(overview.generatedAt),
      )
    : null;

  return (
    <p className="text-[11px] leading-relaxed text-muted-foreground" role="note">
      {liveMetrics && generated ? (
        <>
          KPIs, work orders, and notices refresh from your assigned-hostel API (last updated {generated}). Tab focus
          triggers an immediate sync. Mark today&apos;s shift from Attendance &amp; Shifts when your duty roster is active.
        </>
      ) : (
        <>Connect to the API to load live work orders and hostel context.</>
      )}
    </p>
  );
}