'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  CalendarCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';

import { useStudentAttendanceDesk } from '@/hooks/use-student-attendance-desk';
import type { StudentAttendanceDayStatus } from '@/lib/api/student-attendance';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;
const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

function shiftMonth(monthIso: string, delta: number): string {
  const [y, m] = monthIso.split('-').map(Number);
  const d = new Date(Date.UTC(y!, (m ?? 1) - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function currentMonthIso(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

function formatSyncTime(iso: string | undefined): string {
  if (!iso) return 'Syncing…';
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(iso));
}

const statusStyles: Record<
  StudentAttendanceDayStatus,
  { cell: string; badge: string; dot: string }
> = {
  PRESENT: {
    cell: 'border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage)_12%,var(--card))]',
    badge:
      'border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage-light)_50%,var(--card))] text-[var(--nestora-forest)]',
    dot: 'bg-[var(--nestora-forest)]',
  },
  ABSENT: {
    cell: 'border-[color-mix(in_oklch,#c2410c_25%,var(--border))] bg-[color-mix(in_oklch,#c2410c_8%,var(--card))]',
    badge: 'border-[color-mix(in_oklch,#c2410c_30%,var(--border))] bg-[color-mix(in_oklch,#c2410c_10%,var(--card))] text-[#9a3412]',
    dot: 'bg-[#c2410c]',
  },
  ON_LEAVE: {
    cell: 'border-[color-mix(in_oklch,var(--nestora-gold)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_12%,var(--card))]',
    badge:
      'border-[color-mix(in_oklch,var(--nestora-gold)_40%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_15%,var(--card))] text-[var(--nestora-forest)]',
    dot: 'bg-[var(--nestora-gold)]',
  },
};

export function StudentAttendancePage() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [viewMonth, setViewMonth] = useState(currentMonthIso);
  const currentMonth = currentMonthIso();
  const isCurrentMonth = viewMonth === currentMonth;
  const canGoNext = viewMonth < currentMonth;
  const { desk, loading, error, refresh, isRefreshing } = useStudentAttendanceDesk({
    pollIntervalMs: 20_000,
    month: viewMonth,
  });

  const percent = desk?.summary.percent ?? null;
  const syncLabel = useMemo(() => formatSyncTime(desk?.generatedAt), [desk?.generatedAt]);

  const leadingBlanks = useMemo(() => {
    if (!desk?.calendar.length) return 0;
    const first = desk.calendar[0]!;
    const map: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
    return map[first.weekdayShort] ?? 0;
  }, [desk?.calendar]);

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-student-attendance-block]'), {
        opacity: 0,
        y: 14,
        duration: 0.42,
        stagger: 0.06,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: rootRef, dependencies: [reduceMotion, desk?.month] },
  );

  return (
    <div ref={rootRef} className="space-y-6 pb-6">
      <div data-student-attendance-block className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="size-5 text-[var(--nestora-gold)]" aria-hidden />
            <h1 className="text-2xl font-bold tracking-tight text-[var(--nestora-forest)]">My Attendance</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Live hostel roll-call synced with warden records. Updates every 20 seconds.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground tabular-nums">
            Last sync {syncLabel}
            {isRefreshing ? ' · refreshing' : ''}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn('gap-1.5', focusRing)}
            onClick={() => refresh()}
            disabled={loading}
          >
            {loading || isRefreshing ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
            ) : (
              <RefreshCw className="size-3.5" aria-hidden />
            )}
            Refresh
          </Button>
          <Link href="/student" className={cn('text-sm font-semibold text-[var(--nestora-forest)] hover:underline', focusRing)}>
            Back to dashboard
          </Link>
        </div>
      </div>

      {error ? (
        <div
          data-student-attendance-block
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          <span>{error}</span>
          <Button type="button" variant="outline" size="sm" onClick={() => refresh()}>
            Retry
          </Button>
        </div>
      ) : null}

      {desk && !desk.profileLinked && !loading ? (
        <motion.div
          data-student-attendance-block
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: motionEase }}
          className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center"
        >
          <p className="font-semibold text-[var(--nestora-forest)]">Profile not linked</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your login is not linked to a student record yet. Ask the warden or admin to complete registration.
          </p>
        </motion.div>
      ) : null}

      {loading && !desk ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading attendance…
        </div>
      ) : null}

      {desk ? (
        <>
          <motion.section
            data-student-attendance-block
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: motionEase }}
            className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]"
          >
            <div className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_20%,var(--border))] bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold text-[var(--nestora-forest)]">Monthly summary</h2>
                  <p className="text-sm text-muted-foreground">{desk.monthLabel}</p>
                </div>
                <Badge variant="outline" className="font-semibold text-[var(--nestora-forest)]">
                  {desk.summary.standing}
                </Badge>
              </div>

              <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-4xl font-bold tabular-nums text-[var(--nestora-forest)]">
                    {percent != null ? `${percent}%` : '—'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {desk.summary.recordedDays} of {desk.summary.daysInMonth} days recorded
                  </p>
                </div>
                {desk.today.status ? (
                  <Badge className={cn('text-xs', statusStyles[desk.today.status].badge)} variant="outline">
                    Today: {desk.today.status === 'PRESENT' ? 'Present' : desk.today.status === 'ABSENT' ? 'Absent' : 'On leave'}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    Today: not marked yet
                  </Badge>
                )}
              </div>

              <div
                className="mt-4 h-2 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={percent ?? 0}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Monthly attendance percentage"
              >
                <motion.div
                  className="h-full rounded-full bg-[linear-gradient(90deg,var(--nestora-sage),var(--nestora-forest))]"
                  initial={reduceMotion ? { width: `${percent ?? 0}%` } : { width: 0 }}
                  animate={{ width: `${percent ?? 0}%` }}
                  transition={{ duration: 0.6, ease: motionEase }}
                />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { label: 'Present', value: desk.summary.present, accent: 'var(--nestora-forest)' },
                  { label: 'Absent', value: desk.summary.absent, accent: '#c2410c' },
                  { label: 'Leave', value: desk.summary.onLeave, accent: 'var(--nestora-gold)' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-border bg-muted/25 p-3 text-center"
                  >
                    <p className="text-lg font-bold tabular-nums" style={{ color: item.accent }}>
                      {String(item.value).padStart(2, '0')}
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_20%,var(--border))] bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <motion.div className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-[var(--nestora-gold)]" aria-hidden />
                  <h2 className="text-base font-semibold text-[var(--nestora-forest)]">Legend</h2>
                </motion.div>
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                {(
                  [
                    ['PRESENT', 'Present — marked in hostel roll-call'],
                    ['ABSENT', 'Absent — not in hostel when marked'],
                    ['ON_LEAVE', 'On leave — approved leave window'],
                  ] as const
                ).map(([key, text]) => (
                  <li key={key} className="flex items-center gap-2 text-muted-foreground">
                    <span className={cn('size-2.5 shrink-0 rounded-full', statusStyles[key].dot)} aria-hidden />
                    {text}
                  </li>
                ))}
                <li className="flex items-center gap-2 text-muted-foreground">
                  <span className="size-2.5 shrink-0 rounded-full border border-border bg-muted/40" aria-hidden />
                  No record — day not marked or upcoming
                </li>
              </ul>
              <p className="mt-auto pt-4 text-xs text-muted-foreground">
                Disputes or corrections are handled by your warden. This view is read-only.
              </p>
            </div>
          </motion.section>

          <motion.section
            data-student-attendance-block
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.04, ease: motionEase }}
            className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_20%,var(--border))] bg-card p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-[var(--nestora-forest)]">Calendar</h2>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn('size-8', focusRing)}
                  aria-label="Previous month"
                  onClick={() => setViewMonth((m) => shiftMonth(m, -1))}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="min-w-[9rem] text-center text-sm font-medium tabular-nums text-[var(--nestora-forest)]">
                  {desk.monthLabel}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn('size-8', focusRing)}
                  aria-label="Next month"
                  disabled={!canGoNext}
                  onClick={() => {
                    if (canGoNext) setViewMonth((m) => shiftMonth(m, 1));
                  }}
                >
                  <ChevronRight className="size-4" />
                </Button>
                {!isCurrentMonth ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="ml-1 text-xs"
                    onClick={() => setViewMonth(currentMonthIso())}
                  >
                    This month
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-1.5">
              {Array.from({ length: leadingBlanks }).map((_, i) => (
                <div key={`pad-${i}`} className="aspect-square" aria-hidden />
              ))}
              {desk.calendar.map((day) => {
                const style = day.status ? statusStyles[day.status] : null;
                return (
                  <div
                    key={day.date}
                    title={day.status ? `${day.date}: ${day.status}` : day.date}
                    className={cn(
                      'relative flex aspect-square flex-col items-center justify-center rounded-lg border text-xs',
                      day.isToday && 'ring-2 ring-[color-mix(in_oklch,var(--nestora-forest)_25%,transparent)]',
                      day.isFuture && !day.status && 'border-dashed border-border bg-muted/20 text-muted-foreground',
                      !day.status && !day.isFuture && 'border-border bg-muted/15 text-muted-foreground',
                      style?.cell,
                    )}
                  >
                    <span className="font-semibold tabular-nums text-[var(--nestora-forest)]">{day.dayOfMonth}</span>
                    {day.status ? (
                      <span className={cn('mt-0.5 size-1.5 rounded-full', style!.dot)} aria-hidden />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </motion.section>

          <motion.section
            data-student-attendance-block
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.06, ease: motionEase }}
            className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_20%,var(--border))] bg-card p-5 shadow-sm"
          >
            <h2 className="text-base font-semibold text-[var(--nestora-forest)]">History</h2>
            <p className="text-sm text-muted-foreground">All marks recorded for {desk.monthLabel}.</p>

            {desk.history.length === 0 ? (
              <p className="mt-6 text-center text-sm text-muted-foreground">No attendance records for this month yet.</p>
            ) : (
              <div className="mt-4 overflow-x-auto rounded-xl border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden sm:table-cell">Recorded at</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {desk.history.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium text-[var(--nestora-forest)]">{row.dateLabel}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn('text-xs', statusStyles[row.status].badge)}>
                            {row.statusLabel}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground sm:table-cell">
                          {new Intl.DateTimeFormat('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          }).format(new Date(row.recordedAt))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </motion.section>
        </>
      ) : null}
    </div>
  );
}