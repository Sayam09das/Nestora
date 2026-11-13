'use client';

import type { OperationalDashboardOverview } from '@/lib/api/dashboard';

type Props = {
  liveMetrics: boolean;
  overview: OperationalDashboardOverview | null;
};

export function WardenDashboardFootnote({ liveMetrics, overview }: Props) {
  const generated = overview?.generatedAt
    ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(
        new Date(overview.generatedAt),
      )
    : null;

  return (
    <p className="text-[11px] leading-relaxed text-muted-foreground" role="note">
      {liveMetrics && generated ? (
        <>
          Desk panels refresh from your assigned-hostel API every ~20 seconds (last updated {generated}). Tab focus and
          returning to this page trigger an immediate sync.
        </>
      ) : (
        <>Connect to the API or pick an assigned hostel to load live KPIs and desk panels.</>
      )}
    </p>
  );
}
