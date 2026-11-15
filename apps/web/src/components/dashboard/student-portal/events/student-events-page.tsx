'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  CalendarHeart,
  CheckCircle2,
  Loader2,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useStudentEventsDesk } from '@/hooks/use-student-events-desk';
import { acknowledgeStudentNotice } from '@/lib/api/student-announcements';
import type { StudentEventItem } from '@/lib/api/student-events';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;
const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type FilterKey = 'all' | 'upcoming' | 'ongoing';

const timingStyles = {
  upcoming:
    'border-[color-mix(in_oklch,var(--nestora-gold)_40%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_12%,var(--card))] text-[#9a3412]',
  ongoing:
    'border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage-light)_45%,var(--card))] text-[var(--nestora-forest)]',
  past: 'border-border bg-muted/40 text-muted-foreground',
} as const;

function formatSyncTime(iso: string | undefined): string {
  if (!iso) return 'Syncing…';
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(iso));
}

function EventCard({
  item,
  index,
  reduceMotion,
  acknowledging,
  onAcknowledge,
}: {
  item: StudentEventItem;
  index: number;
  reduceMotion: boolean | null;
  acknowledging: boolean;
  onAcknowledge: (id: string) => void;
}) {
  const needsAck = item.requiresAcknowledgement && !item.acknowledged;

  return (
    <motion.li
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.32, ease: motionEase }}
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-stretch"
    >
      <div
        className="flex size-16 shrink-0 flex-col items-center justify-center self-start rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-cream)_35%,var(--card))] text-center"
        aria-hidden
      >
        <span className="text-xl font-bold leading-none text-[var(--nestora-forest)]">{item.day}</span>
        <span className="mt-0.5 text-[10px] font-bold tracking-widest text-muted-foreground">{item.month}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-[var(--nestora-forest)]">{item.title}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {item.scope} · {item.eventAtDisplay}
            </p>
          </div>
          <Badge variant="outline" className={cn('text-xs font-semibold', timingStyles[item.timing])}>
            {item.timingLabel}
          </Badge>
        </div>

        <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-foreground">
          <MapPin className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
          {item.scheduleLabel}
        </p>

        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{item.description}</p>

        {item.endsAt ? (
          <p className="mt-2 text-xs text-muted-foreground">Ends {item.endsAt}</p>
        ) : null}

        <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
          <motion.div className="text-xs text-muted-foreground">
            {item.acknowledged && item.acknowledgedAt ? (
              <span className="text-[var(--nestora-forest)]">Registered · {item.acknowledgedAt}</span>
            ) : item.requiresAcknowledgement ? (
              <span>Confirmation required for attendance</span>
            ) : (
              <span>Open event — no registration needed</span>
            )}
          </motion.div>
          {needsAck ? (
            <Button
              type="button"
              size="sm"
              className={cn('gap-1.5 bg-[var(--nestora-forest)]', focusRing)}
              disabled={acknowledging}
              onClick={() => onAcknowledge(item.id)}
            >
              {acknowledging ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
              Confirm participation
            </Button>
          ) : null}
        </footer>
      </div>
    </motion.li>
  );
}

function EventsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
      <Skeleton className="h-36 rounded-2xl" />
      <Skeleton className="h-36 rounded-2xl" />
    </div>
  );
}

export function StudentEventsPage() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const { desk, loading, error, isRefreshing, refresh } = useStudentEventsDesk();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [ackingId, setAckingId] = useState<string | null>(null);

  const syncLabel = useMemo(() => formatSyncTime(desk?.generatedAt), [desk?.generatedAt]);

  const filtered = useMemo(() => {
    const list = desk?.events.filter((e) => e.timing !== 'past') ?? [];
    if (filter === 'upcoming') return list.filter((e) => e.timing === 'upcoming');
    if (filter === 'ongoing') return list.filter((e) => e.timing === 'ongoing');
    return list;
  }, [desk?.events, filter]);

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-student-events-block]'), {
        opacity: 0,
        y: 14,
        duration: 0.42,
        stagger: 0.06,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: rootRef, dependencies: [reduceMotion, filtered.length, filter] },
  );

  const acknowledge = async (noticeId: string) => {
    setAckingId(noticeId);
    const result = await acknowledgeStudentNotice(noticeId);
    setAckingId(null);
    if (result.desk) {
      void refresh();
      toast.success('Participation confirmed.');
    } else {
      toast.error(result.error ?? 'Could not confirm participation.');
    }
  };

  const summary = desk?.summary;

  return (
    <div ref={rootRef} className="space-y-6 pb-8">
      <header data-student-events-block className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <motion.div className="flex items-center gap-2">
            <CalendarHeart className="size-5 text-[var(--nestora-sage)]" aria-hidden />
            <h1 className="text-2xl font-bold tracking-tight text-[var(--nestora-forest)]">Events &amp; Activities</h1>
          </motion.div>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Live event notices from {desk?.hostelName ?? 'your hostel'} and university-wide activities. Refreshes every 20
            seconds.
          </p>
          <motion.div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] bg-card px-3 py-1 text-xs font-medium text-[var(--nestora-forest)]">
              Live · {syncLabel}
              {isRefreshing ? ' · refreshing' : ''}
            </span>
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => refresh()} disabled={loading}>
              {loading || isRefreshing ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
              Refresh
            </Button>
            <Link href="/student" className={cn('text-sm font-semibold text-[var(--nestora-forest)] hover:underline', focusRing)}>
              Back to dashboard
            </Link>
          </motion.div>
        </div>
      </header>

      {error ? (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          <span>{error}</span>
          <Button type="button" variant="outline" size="sm" onClick={() => refresh()}>
            Retry
          </Button>
        </div>
      ) : null}

      {loading && !desk ? <EventsSkeleton /> : null}

      {summary ? (
        <>
          <section data-student-events-block className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Events summary">
            {(
              [
                ['Live events', summary.total],
                ['Upcoming', summary.upcoming],
                ['Happening now', summary.ongoing],
                ['Need confirmation', summary.needsAck],
              ] as const
            ).map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-border bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--card))] px-4 py-3"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--nestora-forest)]">{value}</p>
              </div>
            ))}
          </section>

          <div data-student-events-block className="flex flex-wrap gap-2">
            {(
              [
                ['all', 'All'],
                ['upcoming', 'Upcoming'],
                ['ongoing', 'Ongoing'],
              ] as const
            ).map(([key, label]) => (
              <Button
                key={key}
                type="button"
                size="sm"
                variant={filter === key ? 'default' : 'outline'}
                className={filter === key ? 'bg-[var(--nestora-forest)]' : undefined}
                onClick={() => setFilter(key)}
              >
                {label}
              </Button>
            ))}
          </div>

          <ul data-student-events-block className="space-y-4">
            {filtered.length === 0 ? (
              <li className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-12 text-center text-sm text-muted-foreground">
                No upcoming events right now. Wardens publish activities under the <strong>Events</strong> notice category
                — check back after the next circular.
              </li>
            ) : (
              filtered.map((item, index) => (
                <EventCard
                  key={item.id}
                  item={item}
                  index={index}
                  reduceMotion={reduceMotion}
                  acknowledging={ackingId === item.id}
                  onAcknowledge={acknowledge}
                />
              ))
            )}
          </ul>

          <p data-student-events-block className="text-xs text-muted-foreground">
            Tip: add <span className="font-mono">Venue: Common Room</span> on the first line of an event notice so the
            schedule shows the right location.
          </p>
        </>
      ) : null}
    </div>
  );
}