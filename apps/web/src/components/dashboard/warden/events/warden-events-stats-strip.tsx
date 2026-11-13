'use client';

import { CalendarClock, CalendarDays, PartyPopper, Users } from 'lucide-react';
import { useMemo } from 'react';

import type { AnnouncementRecord } from '@/components/dashboard/announcements/admin-announcements-data';
import type { AnnouncementsDeskSummary } from '@/lib/api/announcements';

type Props = {
  summary: AnnouncementsDeskSummary | null;
  notices: AnnouncementRecord[];
  loading?: boolean;
};

export function WardenEventsStatsStrip({ summary, notices, loading = false }: Props) {
  const eventLive = useMemo(() => notices.filter((n) => n.status === 'Live').length, [notices]);
  const eventScheduled = useMemo(() => notices.filter((n) => n.status === 'Scheduled').length, [notices]);
  const needsAck = useMemo(
    () => notices.filter((n) => n.requiresAcknowledgement && n.acknowledgedCount < n.targetCount).length,
    [notices],
  );

  const cards = [
    {
      label: 'Live events',
      value: loading && notices.length === 0 ? '…' : eventLive,
      hint: 'On the calendar now',
      icon: PartyPopper,
    },
    {
      label: 'Scheduled',
      value: loading && notices.length === 0 ? '…' : eventScheduled,
      hint: 'Upcoming postings',
      icon: CalendarClock,
    },
    {
      label: 'Ack reminders',
      value: loading && notices.length === 0 ? '…' : needsAck,
      hint: 'Notices awaiting students',
      icon: Users,
    },
    {
      label: 'Published (month)',
      value: summary?.publishedThisMonth ?? (loading ? '…' : 0),
      hint: 'All notice categories',
      icon: CalendarDays,
    },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Events metrics">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article
            key={card.label}
            className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{card.label}</p>
              <Icon className="size-4 text-[var(--nestora-sage)]" aria-hidden />
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--nestora-forest)]">{card.value}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{card.hint}</p>
          </article>
        );
      })}
    </section>
  );
}
