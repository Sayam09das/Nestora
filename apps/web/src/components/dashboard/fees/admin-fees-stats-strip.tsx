'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Bell, CalendarClock, CheckCircle2, TrendingUp, Wallet } from 'lucide-react';
import { useMemo, useRef } from 'react';

import { formatInr } from '@/components/dashboard/fees/admin-fees-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import type { FinanceDeskSummary } from '@/lib/api/finance';

const motionEase = [0.22, 1, 0.36, 1] as const;

type Props = {
  summary: FinanceDeskSummary | null;
  loading?: boolean;
};

export function AdminFeesStatsStrip({ summary, loading = false }: Props) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const monthLabel = summary?.collectedMonthLabel ?? new Intl.DateTimeFormat('en-IN', { month: 'short' }).format(new Date());

  const cards = useMemo(
    () => [
      {
        key: 'col',
        label: `Collected (${monthLabel})`,
        value: loading && !summary ? '…' : formatInr(summary?.collectedMonth ?? 0),
        hint: 'Online + offline',
        icon: TrendingUp,
        accent: 'var(--nestora-forest)',
      },
      {
        key: 'out',
        label: 'Outstanding',
        value: loading && !summary ? '…' : formatInr(summary?.outstandingTotal ?? 0),
        hint: 'Due & overdue',
        icon: Wallet,
        accent: 'var(--nestora-gold)',
      },
      {
        key: 'appr',
        label: 'Pending approvals',
        value: summary?.pendingApprovals ?? (loading ? '…' : 0),
        hint: 'Waivers & schedules',
        icon: CheckCircle2,
        accent: '#7c3aed',
      },
      {
        key: 'sched',
        label: 'Active schedules',
        value: summary?.activeSchedules ?? (loading ? '…' : 0),
        hint: 'FR-074',
        icon: CalendarClock,
        accent: 'var(--nestora-sage)',
      },
      {
        key: 'rem',
        label: 'Reminders',
        value: summary?.remindersQueued ?? (loading ? '…' : 0),
        hint: 'FR-082',
        icon: Bell,
        accent: '#0ea5e9',
      },
    ],
    [summary, loading, monthLabel],
  );

  useGSAP(
    () => {
      if (reduceMotion || !sectionRef.current) return;
      gsap.from(sectionRef.current.querySelectorAll('[data-fee-stat]'), {
        opacity: 0,
        y: 14,
        duration: 0.4,
        stagger: { each: 0.06, grid: 'auto' },
        ease: 'back.out(1.1)',
        clearProps: 'opacity,transform',
      });
    },
    { scope: sectionRef, dependencies: [reduceMotion] },
  );

  return (
    <section ref={sectionRef} aria-labelledby="fee-stats-heading" className="space-y-3">
      <h2 id="fee-stats-heading" className="sr-only">
        Fees statistics
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <li key={card.key} data-fee-stat>
              <motion.article
                whileHover={reduceMotion ? undefined : { y: -3 }}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.35, ease: motionEase }}
                className="rounded-2xl border bg-card p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{card.label}</p>
                  <Icon className="size-4" style={{ color: card.accent }} aria-hidden />
                </div>
                <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--nestora-forest)]">{card.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
              </motion.article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
