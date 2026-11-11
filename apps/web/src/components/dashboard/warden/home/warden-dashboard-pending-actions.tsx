'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { CalendarClock, ChevronRight, ClipboardList, MessageSquareWarning, Plane, Wrench } from 'lucide-react';
import Link from 'next/link';

import type { WardenDashboardSnapshot } from '@/components/dashboard/warden/home/warden-dashboard-data';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = { snapshot: WardenDashboardSnapshot };

export function WardenDashboardPendingActions({ snapshot }: Props) {
  const reduceMotion = useReducedMotion();
  const { pending } = snapshot;

  const rows = [
    {
      id: 'leave',
      label: 'Leave Requests',
      hint: `${pending.leave} pending`,
      href: '/warden/leave',
      icon: Plane,
      accent: 'var(--nestora-gold)',
    },
    {
      id: 'outings',
      label: 'Outing Requests',
      hint: `${pending.outings} pending`,
      href: '/warden/leave',
      icon: CalendarClock,
      accent: 'var(--nestora-sage)',
    },
    {
      id: 'admissions',
      label: 'Admission verifications',
      hint: `${pending.admissions} awaiting tier-2`,
      href: '/warden/students',
      icon: ClipboardList,
      accent: 'var(--nestora-forest)',
    },
    {
      id: 'complaints',
      label: 'Student Complaints',
      hint: `${pending.complaints} unresolved`,
      href: '/warden/complaints',
      icon: MessageSquareWarning,
      accent: 'var(--nestora-tan)',
    },
    {
      id: 'maintenance',
      label: 'Maintenance Requests',
      hint: `${pending.maintenance} pending`,
      href: '/warden/maintenance',
      icon: Wrench,
      accent: 'var(--nestora-forest)',
    },
  ];

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.06, ease: motionEase }}
      className="flex h-full flex-col rounded-2xl border border-[color-mix(in_oklch,var(--nestora-gold)_22%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_6%,var(--card))] p-5 shadow-sm"
      aria-labelledby="warden-pending-heading"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 id="warden-pending-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
            Pending Actions
          </h2>
          <p className="text-sm text-muted-foreground">Items that need your decision today</p>
        </div>
        <span className="rounded-full bg-[var(--nestora-gold)] px-2.5 py-0.5 text-xs font-bold text-[var(--nestora-forest)]">
          {pending.total} pending
        </span>
      </div>

      <ul className="mt-4 space-y-2">
        {rows.map((row, index) => {
          const Icon = row.icon;
          return (
            <motion.li
              key={row.id}
              initial={reduceMotion ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 + index * 0.05, duration: 0.28, ease: motionEase }}
            >
              <Link
                href={row.href}
                className={cn(
                  'group flex items-center gap-3 rounded-xl border border-border/70 bg-card/90 px-3 py-3',
                  'transition-[border-color,box-shadow] hover:border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] hover:shadow-sm',
                  focusRing,
                )}
              >
                <span
                  className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/50"
                  aria-hidden
                >
                  <Icon className="size-4" style={{ color: row.accent }} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-foreground">{row.label}</span>
                  <span className="text-xs text-muted-foreground">{row.hint}</span>
                </span>
                <ChevronRight
                  className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </motion.li>
          );
        })}
      </ul>
    </motion.section>
  );
}
