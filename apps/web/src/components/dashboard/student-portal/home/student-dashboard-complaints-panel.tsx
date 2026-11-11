'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ChevronRight, MessageSquareWarning, Plus } from 'lucide-react';
import Link from 'next/link';

import type { StudentDashboardSnapshot } from '@/components/dashboard/student-portal/home/student-dashboard-data';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;
const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = { snapshot: StudentDashboardSnapshot };

export function StudentDashboardComplaintsPanel({ snapshot }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: motionEase }}
      className="flex h-full flex-col rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card p-5 shadow-sm"
      aria-labelledby="student-complaints-heading"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MessageSquareWarning className="size-4 text-[#c2410c]" aria-hidden />
          <h2 id="student-complaints-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
            My Complaints
          </h2>
        </div>
        <Link
          href="/student/complaints"
          className={cn('text-xs font-semibold text-[var(--nestora-sage)] hover:underline', focusRing)}
        >
          View All
          <ChevronRight className="ml-0.5 inline size-3.5" aria-hidden />
        </Link>
      </div>

      <ul className="mt-4 space-y-3">
        {snapshot.complaints.map((item, index) => (
          <motion.li
            key={item.id}
            initial={reduceMotion ? false : { opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06, duration: 0.3, ease: motionEase }}
            className="flex gap-3 rounded-xl border border-border p-3"
          >
            <span
              className={cn(
                'mt-0.5 size-2 shrink-0 rounded-full',
                item.status === 'resolved' ? 'bg-[var(--nestora-sage)]' : 'bg-[var(--nestora-gold)]',
              )}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.location}</p>
            </div>
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              {item.statusLabel}
            </span>
          </motion.li>
        ))}
      </ul>

      <Link
        href="/student/complaints"
        className={cn(
          'mt-4 inline-flex h-9 w-full items-center justify-center gap-1.5 bg-secondary px-2.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]',
          focusRing,
        )}
      >
        <Plus className="size-4" aria-hidden />
        Submit Complaint
      </Link>
    </motion.section>
  );
}
