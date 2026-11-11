'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ChevronRight, Megaphone } from 'lucide-react';
import Link from 'next/link';

import type { StudentDashboardSnapshot } from '@/components/dashboard/student-portal/home/student-dashboard-data';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;
const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = { snapshot: StudentDashboardSnapshot };

export function StudentDashboardAnnouncementsPanel({ snapshot }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: motionEase }}
      className="flex h-full flex-col rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card p-5 shadow-sm"
      aria-labelledby="student-announcements-heading"
    >
      <div className="flex items-center gap-2">
        <Megaphone className="size-4 text-[var(--nestora-gold)]" aria-hidden />
        <h2 id="student-announcements-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
          Latest Announcements
        </h2>
      </div>

      <ul className="mt-4 space-y-3">
        {snapshot.announcements.map((item, index) => (
          <motion.li
            key={item.id}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.32, ease: motionEase }}
            className="rounded-xl border border-border bg-[color-mix(in_oklch,var(--nestora-cream)_15%,var(--card))] p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-foreground">{item.title}</p>
              <time className="shrink-0 text-[11px] font-semibold text-[var(--nestora-gold)]">{item.relativeTime}</time>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
            <p className="mt-2 text-[11px] font-medium text-[var(--nestora-sage)]">{item.author}</p>
          </motion.li>
        ))}
      </ul>

      <Link
        href="/student/announcements"
        className={cn(
          'mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--nestora-forest)] hover:underline',
          focusRing,
        )}
      >
        View All Announcements
        <ChevronRight className="size-4" aria-hidden />
      </Link>
    </motion.section>
  );
}
