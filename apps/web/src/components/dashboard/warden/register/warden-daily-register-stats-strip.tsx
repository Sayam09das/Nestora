'use client';

import type { DailyRegisterDeskSummary } from '@/lib/api/daily-register';
import { liveMetricNumber } from '@/lib/api/live-metric';
import { cn } from '@/lib/utils';

type Props = {
  summary: DailyRegisterDeskSummary | null;
  loading?: boolean;
};

export function WardenDailyRegisterStatsStrip({ summary, loading }: Props) {
  const rate = summary?.attendance.ratePct;
  const rateLabel =
    rate != null ? `${rate}%` : loading && !summary ? '—' : summary ? '—' : '—';

  const tiles = [
    {
      label: 'Log entries',
      value: liveMetricNumber(summary?.totalEntries, loading),
      hint: 'Events on this date',
    },
    {
      label: 'Night attendance',
      value: rateLabel,
      hint: summary
        ? `${summary.attendance.present} present · ${summary.attendance.onLeave} on leave`
        : 'Roll-up for selected day',
    },
    {
      label: 'Gate movements',
      value: liveMetricNumber(summary?.counts.Movement, loading),
      hint: 'Departures & returns',
    },
    {
      label: 'Visitors',
      value: liveMetricNumber(summary?.counts.Visitor, loading),
      hint: 'Register / in / out',
    },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map((tile) => (
        <article
          key={tile.label}
          className={cn(
            'rounded-2xl border bg-card p-4 shadow-sm',
            'border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))]',
          )}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{tile.label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-[var(--nestora-forest)]">{tile.value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{tile.hint}</p>
        </article>
      ))}
    </section>
  );
}
