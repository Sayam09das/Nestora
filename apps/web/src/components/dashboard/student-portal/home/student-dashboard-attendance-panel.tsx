'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { CalendarCheck, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import type { StudentDashboardSnapshot } from '@/components/dashboard/student-portal/home/student-dashboard-data';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;
const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = { snapshot: StudentDashboardSnapshot };

export function StudentDashboardAttendancePanel({ snapshot }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.04, ease: motionEase }}
      className="flex h-full flex-col rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_20%,var(--border))] bg-card p-5 shadow-sm"
      aria-labelledby="student-attendance-heading"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <CalendarCheck className="size-4 text-[var(--nestora-gold)]" aria-hidden />
          <motion.div>
            <h2 id="student-attendance-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
              Attendance Overview
            </h2>
            <p className="text-sm text-muted-foreground">{snapshot.attendanceMonth}</p>
          </motion.div>
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-3xl font-bold tabular-nums text-[var(--nestora-forest)]">{snapshot.attendancePercent}%</p>
          <p className="text-xs text-muted-foreground">Overall attendance</p>
        </div>
        <span className="rounded-full bg-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--muted))] px-2.5 py-1 text-xs font-semibold text-[var(--nestora-forest)]">
          {snapshot.attendanceStanding}
        </span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={snapshot.attendancePercent} aria-valuemin={0} aria-valuemax={100} aria-label="Monthly attendance percentage">
        <motion.div
          className="h-full rounded-full bg-[linear-gradient(90deg,var(--nestora-sage),var(--nestora-forest))]"
          initial={reduceMotion ? { width: `${snapshot.attendancePercent}%` } : { width: 0 }}
          animate={{ width: `${snapshot.attendancePercent}%` }}
          transition={{ duration: 0.6, ease: motionEase }}
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2" role="list" aria-label="Attendance breakdown">
        {[
          { label: 'Present', value: snapshot.attendancePresent, accent: 'var(--nestora-forest)' },
          { label: 'Absent', value: snapshot.attendanceAbsent, accent: '#c2410c' },
          { label: 'Leave', value: snapshot.attendanceLeave, accent: 'var(--nestora-gold)' },
        ].map((item) => (
          <div
            key={item.label}
            role="listitem"
            className="rounded-xl border border-border bg-muted/25 p-3 text-center"
          >
            <p className="text-lg font-bold tabular-nums" style={{ color: item.accent }}>
              {String(item.value).padStart(2, '0')}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>

      <Link
        href="/student/attendance"
        className={cn(
          'mt-auto pt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--nestora-forest)] hover:underline',
          focusRing,
        )}
      >
        View Attendance History
        <ChevronRight className="size-4" aria-hidden />
      </Link>
    </motion.section>
  );
}
