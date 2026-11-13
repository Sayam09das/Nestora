'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { AlarmClock, CalendarCheck, Hourglass, PlaneTakeoff, Repeat2 } from 'lucide-react';
import { useMemo, useRef } from 'react';

import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import type { LeaveDeskSummary } from '@/lib/api/leaves';

const motionEase = [0.22, 1, 0.36, 1] as const;

type Props = {
  summary: LeaveDeskSummary | null;
  loading?: boolean;
};

export function AdminLeaveStatsStrip({ summary, loading = false }: Props) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const cards = useMemo(
    () => [
      {
        key: 'pending',
        label: 'Pending review',
        value: summary?.pendingReview ?? (loading ? '…' : 0),
        hint: 'Warden queue',
        icon: Hourglass,
        accent: 'var(--nestora-gold)',
      },
      {
        key: 'on',
        label: 'On leave now',
        value: summary?.onLeaveNow ?? (loading ? '…' : 0),
        hint: 'Beds still occupied',
        icon: PlaneTakeoff,
        accent: 'var(--nestora-forest)',
      },
      {
        key: 'today',
        label: 'Returning today',
        value: summary?.returningToday ?? (loading ? '…' : 0),
        hint: 'Gate desk watch',
        icon: CalendarCheck,
        accent: '#6d9773',
      },
      {
        key: 'ext',
        label: 'Extensions',
        value: summary?.extensionsPending ?? (loading ? '…' : 0),
        hint: 'FR-041 pending',
        icon: Repeat2,
        accent: '#d97706',
      },
      {
        key: 'late',
        label: 'Overstayed',
        value: summary?.overstayed ?? (loading ? '…' : 0),
        hint: 'FR-043 alerts sent',
        icon: AlarmClock,
        accent: '#dc2626',
      },
    ],
    [summary, loading],
  );

  useGSAP(
    () => {
      if (reduceMotion || !sectionRef.current) return;
      gsap.from(sectionRef.current.querySelectorAll('[data-leave-stat]'), {
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
    <section ref={sectionRef} aria-labelledby="leave-stats-heading" className="space-y-3">
      <h2 id="leave-stats-heading" className="sr-only">
        Leave statistics
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <li key={card.key} data-leave-stat>
              <motion.article
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.35, ease: motionEase }}
                whileHover={reduceMotion ? undefined : { y: -3 }}
                className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{card.label}</p>
                  <span className="flex size-8 items-center justify-center rounded-lg border" style={{ color: card.accent }}>
                    <Icon className="size-4" aria-hidden />
                  </span>
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
