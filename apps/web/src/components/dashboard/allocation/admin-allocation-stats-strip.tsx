'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Bed, Clock, Repeat2, UserCheck, Users } from 'lucide-react';
import { useMemo, useRef } from 'react';

import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import type { AllocationDirectorySummary } from '@/lib/api/allocations';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

type AdminAllocationStatsStripProps = {
  summary: AllocationDirectorySummary | null;
  loading?: boolean;
};

export function AdminAllocationStatsStrip({ summary, loading = false }: AdminAllocationStatsStripProps) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const cards = useMemo(
    () => [
      {
        key: 'pending',
        label: 'Pending Queue',
        value: summary?.pendingQueue ?? 0,
        hint: 'Awaiting bed assignment',
        icon: Clock,
        accent: 'var(--nestora-gold)',
      },
      {
        key: 'today',
        label: 'Allocated Today',
        value: summary?.allocatedToday ?? 0,
        hint: 'Completed in last 24h',
        icon: UserCheck,
        accent: '#6d9773',
      },
      {
        key: 'change',
        label: 'Room Changes',
        value: summary?.roomChangePending ?? 0,
        hint: 'Pending review',
        icon: Repeat2,
        accent: 'var(--nestora-sage)',
      },
      {
        key: 'eligible',
        label: 'Eligible Unallocated',
        value: summary?.eligibleUnallocated ?? 0,
        hint: 'Fully approved students',
        icon: Users,
        accent: 'var(--nestora-forest)',
      },
      {
        key: 'beds',
        label: 'Beds Available',
        value: summary?.bedsAvailable ?? 0,
        hint: 'Assignable inventory',
        icon: Bed,
        accent: 'var(--nestora-gold)',
      },
    ],
    [summary],
  );

  const queueByHostel = summary?.queueByHostel ?? [];

  useGSAP(
    () => {
      if (reduceMotion || !sectionRef.current) return;
      gsap.from(sectionRef.current.querySelectorAll('[data-alloc-stat]'), {
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
    <section ref={sectionRef} aria-labelledby="alloc-stats-heading" className="space-y-3">
      <h2 id="alloc-stats-heading" className="sr-only">
        Room allocation statistics
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <li key={card.key} data-alloc-stat>
              <motion.article
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.35, ease: motionEase }}
                whileHover={reduceMotion ? undefined : { y: -3 }}
                className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{card.label}</p>
                  <span
                    className="flex size-8 items-center justify-center rounded-lg border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))]"
                    style={{ color: card.accent }}
                  >
                    <Icon className="size-4" aria-hidden />
                  </span>
                </div>
                <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--nestora-forest)]">
                  {loading ? '—' : card.value.toLocaleString('en-IN')}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{loading ? '…' : card.hint}</p>
              </motion.article>
            </li>
          );
        })}
      </ul>
      <div data-alloc-stat className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card px-4 py-3" aria-label="Pending by hostel">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--nestora-sage)]">Queue by hostel</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {queueByHostel.length === 0 ? (
            <li className="text-xs text-muted-foreground">{loading ? 'Loading…' : 'No pending queue items.'}</li>
          ) : (
            queueByHostel.map((row) => (
              <li key={row.hostel}>
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--nestora-sage-muted)]/70 bg-[color-mix(in_oklch,var(--nestora-cream)_15%,var(--card))] px-3 py-1 text-xs">
                  <span className="font-medium text-foreground">{row.hostel}</span>
                  <span className="text-muted-foreground">
                    {row.pending} pending · {row.availableBeds} beds free
                  </span>
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
}
