'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

import {
  TASK_STATUS_LABELS,
  type StaffDashboardSnapshot,
  type StaffTaskStatus,
} from '@/components/dashboard/staff-portal/home/staff-dashboard-data';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;
const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

const statusStyles: Record<StaffTaskStatus, string> = {
  completed:
    'border-[color-mix(in_oklch,emerald_55%_30%,var(--border))] bg-[color-mix(in_oklch,emerald_50%_10%,var(--card))] text-emerald-800 dark:text-emerald-200',
  in_progress:
    'border-[color-mix(in_oklch,var(--nestora-gold)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_12%,var(--card))] text-[var(--nestora-forest)]',
  pending: 'border-border bg-muted/40 text-muted-foreground',
  overdue: 'border-[color-mix(in_oklch,#c2410c_35%,var(--border))] bg-[color-mix(in_oklch,#c2410c_10%,var(--card))] text-[#9a3412]',
};

type Props = { snapshot: StaffDashboardSnapshot };

export function StaffDashboardTasksPanel({ snapshot }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: motionEase }}
      className="flex h-full flex-col rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_20%,var(--border))] bg-card p-5 shadow-sm"
      aria-labelledby="staff-tasks-heading"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 id="staff-tasks-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
            My assigned tasks
          </h2>
          <p className="text-sm text-muted-foreground">{snapshot.tasksSectionTitle}</p>
        </div>
        <span className="rounded-full bg-[var(--nestora-forest)] px-2.5 py-0.5 text-xs font-bold text-white">
          {snapshot.tasksTotal} Total
        </span>
      </div>

      <ul className="mt-4 divide-y divide-border rounded-xl border border-border">
        {snapshot.tasks.length === 0 ? (
          <li className="px-4 py-10 text-center text-sm text-muted-foreground">
            {snapshot.liveMetrics
              ? 'No open work orders assigned to you right now.'
              : 'Loading assignments…'}
          </li>
        ) : null}
        {snapshot.tasks.map((task, index) => (
          <motion.li
            key={task.id}
            initial={reduceMotion ? false : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3, ease: motionEase }}
            className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="font-medium text-foreground">{task.title}</p>
              <p className="text-xs text-muted-foreground">
                {task.category} · {task.area}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="text-xs font-medium tabular-nums text-muted-foreground">{task.time}</span>
              <span
                className={cn(
                  'inline-flex min-w-[5.5rem] justify-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                  statusStyles[task.status],
                )}
              >
                {TASK_STATUS_LABELS[task.status]}
              </span>
            </div>
          </motion.li>
        ))}
      </ul>

      <p className="mt-3 text-xs text-muted-foreground">
        Showing {snapshot.tasks.length} of {snapshot.tasksTotal} tasks
      </p>
      <Link
        href="/staff/tasks"
        className={cn(
          'mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[var(--nestora-forest)] hover:underline',
          focusRing,
        )}
      >
        View All Tasks
        <ChevronRight className="size-4" aria-hidden />
      </Link>
    </motion.section>
  );
}
