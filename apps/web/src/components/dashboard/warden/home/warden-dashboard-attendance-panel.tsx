'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import Link from 'next/link';

import type { WardenDashboardSnapshot } from '@/components/dashboard/warden/home/warden-dashboard-data';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = { snapshot: WardenDashboardSnapshot };

export function WardenDashboardAttendancePanel({ snapshot }: Props) {
  const reduceMotion = useReducedMotion();
  const { attendance } = snapshot;

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: motionEase }}
      className="flex h-full flex-col rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card p-5 shadow-sm"
      aria-labelledby="warden-attendance-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="warden-attendance-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
            Today&apos;s Attendance
          </h2>
          <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
            {attendance.percent}%
          </p>
          <p className="text-sm text-muted-foreground">
            {attendance.present} of {attendance.totalStudents} students present
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-[color-mix(in_oklch,var(--nestora-sage)_30%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage)_10%,var(--card))] px-2.5 py-1 text-xs font-semibold text-[var(--nestora-forest)]">
          <TrendingUp className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
          {attendance.sentiment}
        </span>
      </div>

      <Progress value={attendance.percent} className="mt-4 h-2" />

      <ul className="mt-5 grid grid-cols-3 gap-2">
        {[
          { label: 'Present', value: attendance.present, tone: 'text-[var(--nestora-forest)]' },
          { label: 'Absent', value: attendance.absent, tone: 'text-foreground' },
          { label: 'On Leave', value: attendance.onLeave, tone: 'text-muted-foreground' },
        ].map((row) => (
          <li
            key={row.label}
            className="rounded-xl border border-border/80 bg-muted/30 px-3 py-2.5 text-center"
          >
            <p className={cn('text-lg font-semibold tabular-nums', row.tone)}>{row.value}</p>
            <p className="text-[11px] font-medium text-muted-foreground">{row.label}</p>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-[11px] text-muted-foreground">
        Illustrative dashboard data; actual figures should come from attendance records.
      </p>

      <Link
        href="/warden/attendance"
        className={cn('mt-auto pt-4 text-sm font-semibold text-[var(--nestora-sage)] hover:text-[var(--nestora-forest)]', focusRing)}
      >
        Open attendance desk →
      </Link>
    </motion.section>
  );
}
