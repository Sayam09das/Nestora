'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { CalendarDays, ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';

import type { StudentDashboardSnapshot } from '@/components/dashboard/student-portal/home/student-dashboard-data';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;
const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

const statusStyles = {
  pending: 'bg-[color-mix(in_oklch,var(--nestora-gold)_25%,var(--muted))] text-[color-mix(in_oklch,var(--nestora-gold)_90%,#422006)]',
  approved: 'bg-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--muted))] text-[var(--nestora-forest)]',
  rejected: 'bg-[color-mix(in_oklch,#dc2626_15%,var(--muted))] text-[#991b1b]',
} as const;

type Props = { snapshot: StudentDashboardSnapshot };

export function StudentDashboardLeavePanel({ snapshot }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: motionEase }}
      className="flex h-full flex-col rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card p-5 shadow-sm"
      aria-labelledby="student-leave-heading"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 text-[var(--nestora-forest)]" aria-hidden />
          <h2 id="student-leave-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
            My Leave Requests
          </h2>
        </div>
        <Link href="/student/leave" className={cn('text-xs font-semibold text-[var(--nestora-sage)] hover:underline', focusRing)}>
          View All
          <ChevronRight className="ml-0.5 inline size-3.5" aria-hidden />
        </Link>
      </div>

      <ul className="mt-4 space-y-3">
        {snapshot.leaveRequests.map((item, index) => (
          <motion.li
            key={item.id}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.32, ease: motionEase }}
            className="rounded-xl border border-border bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--card))] p-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="font-semibold text-foreground">{item.title}</p>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                  statusStyles[item.status],
                )}
              >
                {item.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{item.dateRange}</p>
            <p className="mt-2 text-xs text-[color-mix(in_oklch,var(--nestora-sage)_80%,var(--muted-foreground))]">
              {item.statusNote}
            </p>
          </motion.li>
        ))}
      </ul>

      <Link
        href="/student/leave"
        className={cn(
          'mt-4 inline-flex h-9 w-full items-center justify-center gap-1.5 bg-[var(--nestora-forest)] px-2.5 text-xs font-medium text-white transition-colors',
          'hover:bg-[color-mix(in_oklch,var(--nestora-forest)_88%,black)]',
          focusRing,
        )}
      >
        <Plus className="size-4" aria-hidden />
        Apply for Leave
      </Link>
    </motion.section>
  );
}
