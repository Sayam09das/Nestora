'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, CalendarDays, CreditCard, MessageSquareWarning, UserRoundPlus, type LucideIcon } from 'lucide-react';
import Link from 'next/link';

import type { StudentQuickAction } from '@/components/dashboard/student-portal/home/student-dashboard-data';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;
const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

const iconById: Record<string, LucideIcon> = {
  leave: CalendarDays,
  complaint: MessageSquareWarning,
  visitor: UserRoundPlus,
  fees: CreditCard,
};

type Props = { actions: StudentQuickAction[] };

export function StudentDashboardQuickActions({ actions }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05, ease: motionEase }}
      className="flex h-full flex-col rounded-2xl border border-[color-mix(in_oklch,var(--nestora-forest)_15%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-forest)_4%,var(--card))] p-5 shadow-sm"
      aria-labelledby="student-quick-actions-heading"
    >
      <h2 id="student-quick-actions-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
        Quick actions
      </h2>
      <p className="text-sm text-muted-foreground">Most-used student services</p>

      <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {actions.map((action, index) => {
          const Icon = iconById[action.id] ?? ArrowUpRight;
          return (
            <motion.li
              key={action.id}
              initial={reduceMotion ? false : { opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.28, ease: motionEase }}
            >
              <Link
                href={action.href}
                className={cn(
                  'group flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-[border-color,box-shadow]',
                  'hover:border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] hover:shadow-sm',
                  focusRing,
                )}
              >
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_oklch,var(--nestora-sage)_12%,var(--muted))] text-[var(--nestora-forest)] transition-transform group-hover:scale-105 motion-reduce:transform-none"
                  aria-hidden
                >
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-foreground">{action.label}</span>
                  <span className="block text-xs text-muted-foreground">{action.description}</span>
                </span>
                <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
              </Link>
            </motion.li>
          );
        })}
      </ul>
    </motion.section>
  );
}
