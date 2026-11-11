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
          KPIs, attendance, and approval counts refresh from your assigned-hostel API (last updated {generated}).{' '}
        </>
      ) : null}
      Queues, issues, visitors, incidents, and admission rows use illustrative desk data until those modules are wired to
      live endpoints (MOD-19 / FR-124).
    </p>
  );
}
