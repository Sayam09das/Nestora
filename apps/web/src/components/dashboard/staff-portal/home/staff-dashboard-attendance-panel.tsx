'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { CalendarCheck, LogIn, LogOut } from 'lucide-react';
import Link from 'next/link';

import type { StaffDashboardSnapshot } from '@/components/dashboard/staff-portal/home/staff-dashboard-data';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;
const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = { snapshot: StaffDashboardSnapshot };

export function StaffDashboardAttendancePanel({ snapshot }: Props) {
  const reduceMotion = useReducedMotion();
  const { attendance } = snapshot;

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.06, ease: motionEase }}
      className="flex h-full flex-col rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_20%,var(--border))] bg-card p-5 shadow-sm"
      aria-labelledby="staff-attendance-heading"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 id="staff-attendance-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
            Attendance summary
          </h2>
          <p className="text-sm text-muted-foreground">
            {snapshot.liveMetrics ? 'Student attendance in your hostel (today)' : 'My Attendance'}
          </p>
        </div>
        <Link href="/staff/attendance" className={cn('text-xs font-medium text-[var(--nestora-sage)] hover:underline', focusRing)}>
          View records
        </Link>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-2xl font-bold tabular-nums text-[var(--nestora-forest)]">
            {attendance.presentDays} / {attendance.totalDays}
          </p>
          <p className="text-xs text-muted-foreground">
            {snapshot.liveMetrics ? 'Present students today' : 'Present days this month'}
          </p>
        </div>
        <span className="rounded-full bg-[color-mix(in_oklch,var(--nestora-sage)_15%,var(--muted))] px-2.5 py-1 text-sm font-bold text-[var(--nestora-forest)]">
          {attendance.percent}%
        </span>
      </div>

      <motion.div
        layout={!reduceMotion}
        className="mt-4 grid grid-cols-3 gap-2"
        role="list"
        aria-label="Attendance breakdown"
      >
        {[
          { label: 'Present', value: attendance.present, accent: 'var(--nestora-forest)' },
          { label: 'Absent', value: attendance.absent, accent: '#c2410c' },
          { label: 'Leave', value: attendance.leave, accent: 'var(--nestora-gold)' },
        ].map((item) => (
          <motion.div
            key={item.label}
            role="listitem"
            whileHover={reduceMotion ? undefined : { y: -2 }}
            className="rounded-xl border border-border bg-muted/25 p-3 text-center"
          >
            <p className="text-lg font-bold tabular-nums" style={{ color: item.accent }}>
              {String(item.value).padStart(2, '0')}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{item.label}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        layout={!reduceMotion}
        className="mt-4 space-y-2 rounded-xl border border-dashed border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-cream)_20%,var(--card))] p-3"
      >
        <p className="flex items-center gap-2 text-sm">
          <LogIn className="size-4 text-[var(--nestora-sage)]" aria-hidden />
          <span className="text-muted-foreground">Today&apos;s check-in</span>
          <span className="ml-auto font-semibold text-foreground">{attendance.checkIn}</span>
        </p>
        <p className="flex items-center gap-2 text-sm">
          <LogOut className="size-4 text-muted-foreground" aria-hidden />
          <span className="text-muted-foreground">Today&apos;s check-out</span>
          <span className="ml-auto font-medium text-muted-foreground">
            {attendance.checkOut ?? 'Not checked out'}
          </span>
        </p>
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarCheck className="size-3.5" aria-hidden />
          {snapshot.liveMetrics
            ? 'Headline counts come from today’s hostel attendance API.'
            : 'Attendance synced for current pay cycle (preview data).'}
        </p>
      </motion.div>
    </motion.section>
  );
}
