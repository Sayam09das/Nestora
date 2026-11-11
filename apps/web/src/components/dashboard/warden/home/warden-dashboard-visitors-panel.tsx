'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { DoorOpen, LogIn, UserPlus, Users } from 'lucide-react';
import Link from 'next/link';

import type { WardenDashboardSnapshot } from '@/components/dashboard/warden/home/warden-dashboard-data';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = { snapshot: WardenDashboardSnapshot };

export function WardenDashboardVisitorsPanel({ snapshot }: Props) {
  const reduceMotion = useReducedMotion();
  const { visitors } = snapshot;

  const stats = [
    { label: 'Total Visitors', value: visitors.total, icon: Users },
    { label: 'Checked Out', value: visitors.checkedOut, icon: DoorOpen },
    { label: 'Inside Hostel', value: String(visitors.inside).padStart(2, '0'), icon: LogIn },
  ];

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05, ease: motionEase }}
      className="flex h-full flex-col rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card p-5 shadow-sm"
      aria-labelledby="warden-visitors-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id="warden-visitors-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
            Today&apos;s visitor activity
          </h2>
          <p className="text-sm text-muted-foreground">Live records at your gate desk</p>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[var(--nestora-sage)]">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--nestora-sage)] opacity-40" />
            <span className="relative inline-flex size-2 rounded-full bg-[var(--nestora-sage)]" />
          </span>
          Live records
        </span>
      </div>

      <ul className="mt-4 grid grid-cols-3 gap-2">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <li
              key={stat.label}
              className="rounded-xl border border-border/80 bg-muted/25 px-2 py-3 text-center"
            >
              <Icon className="mx-auto size-4 text-[var(--nestora-forest)]" aria-hidden />
              <p className="mt-1 text-lg font-semibold tabular-nums">{stat.value}</p>
              <p className="text-[10px] font-medium leading-tight text-muted-foreground">{stat.label}</p>
            </li>
          );
        })}
      </ul>

      <div className="mt-5">
        <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Recent visitors</h3>
        <ul className="mt-2 divide-y divide-border/80">
          {visitors.recent.map((visitor) => (
            <li key={visitor.id} className="flex gap-3 py-3 first:pt-2">
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted/50"
                aria-hidden
              >
                <UserPlus className="size-4 text-[var(--nestora-sage)]" />
              </span>
              <LoginPile visitor={visitor} />
            </li>
          ))}
        </ul>
      </div>

      <Link
        href="/warden/visitors"
        className={cn('mt-auto pt-4 text-sm font-semibold text-[var(--nestora-sage)] hover:text-[var(--nestora-forest)]', focusRing)}
      >
        Open visitor desk →
      </Link>
    </motion.section>
  );
}

function LoginPile({
  visitor,
}: {
  visitor: WardenDashboardSnapshot['visitors']['recent'][number];
}) {
  return (
    <motion.div className="min-w-0 flex-1">
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-sm font-semibold text-foreground">{visitor.name}</p>
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{visitor.time}</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Visiting {visitor.visiting} · Room {visitor.room}
      </p>
    </motion.div>
  );
}
