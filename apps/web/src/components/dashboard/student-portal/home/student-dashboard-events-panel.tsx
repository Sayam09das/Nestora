'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { CalendarHeart } from 'lucide-react';
import Link from 'next/link';

import type { StudentDashboardSnapshot } from '@/components/dashboard/student-portal/home/student-dashboard-data';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;
const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = { snapshot: StudentDashboardSnapshot };

export function StudentDashboardEventsPanel({ snapshot }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: motionEase }}
      className="flex h-full flex-col rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card p-5 shadow-sm"
      aria-labelledby="student-events-heading"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CalendarHeart className="size-4 text-[var(--nestora-sage)]" aria-hidden />
          <h2 id="student-events-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
            Upcoming Events
          </h2>
        </div>
        <Link href="/student/events" className={cn('text-xs font-medium text-[var(--nestora-sage)] hover:underline', focusRing)}>
          View all
        </Link>
      </div>

      <ul className="mt-4 space-y-3">
        {snapshot.events.map((event, index) => (
          <motion.li
            key={event.id}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07, duration: 0.32, ease: motionEase }}
            className="flex gap-3 rounded-xl border border-border bg-muted/15 p-3 transition-colors hover:bg-muted/25"
          >
            <div
              className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl border border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-cream)_30%,var(--card))] text-center"
              aria-hidden
            >
              <span className="text-lg font-bold leading-none text-[var(--nestora-forest)]">{event.day}</span>
              <span className="mt-0.5 text-[9px] font-bold tracking-widest text-muted-foreground">{event.month}</span>
            </div>
            <section className="min-w-0">
              <p className="font-semibold text-foreground">{event.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{event.schedule}</p>
            </section>
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
}
