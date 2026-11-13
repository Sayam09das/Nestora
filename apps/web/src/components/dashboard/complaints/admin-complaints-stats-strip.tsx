'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, Clock, RotateCcw, Sparkles, Ticket } from 'lucide-react';
import { useMemo, useRef } from 'react';

import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import type { ComplaintsDeskSummary } from '@/lib/api/complaints';

const motionEase = [0.22, 1, 0.36, 1] as const;

type Props = {
  summary: ComplaintsDeskSummary | null;
  loading?: boolean;
};

export function AdminComplaintsStatsStrip({ summary, loading = false }: Props) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const cards = useMemo(
    () => [
      {
        key: 'open',
        label: 'Open tickets',
        value: summary?.openTickets ?? (loading ? '…' : 0),
        hint: 'Submitted through In Progress',
        icon: Ticket,
        accent: 'var(--nestora-forest)',
      },
      {
        key: 'sla',
        label: 'SLA at risk',
        value: summary?.slaAtRisk ?? (loading ? '…' : 0),
        hint: 'Needs warden attention',
        icon: AlertTriangle,
        accent: '#dc2626',
      },
      {
        key: 'resolved',
        label: 'Resolved this week',
        value: summary?.resolvedThisWeek ?? (loading ? '…' : 0),
        hint: 'Awaiting student confirm',
        icon: Sparkles,
        accent: '#6d9773',
      },
      {
        key: 'turnaround',
        label: 'Avg turnaround',
        value: loading && !summary ? '…' : `${summary?.avgTurnaroundHours ?? 0}h`,
        hint: 'Rolling 7-day',
        icon: Clock,
        accent: 'var(--nestora-gold)',
      },
      {
        key: 'reopened',
        label: 'Reopened',
        value: summary?.reopened ?? (loading ? '…' : 0),
        hint: 'Flagged on warden board',
        icon: RotateCcw,
        accent: '#d97706',
      },
    ],
    [summary, loading],
  );

  useGSAP(
    () => {
      if (reduceMotion || !sectionRef.current) return;
      gsap.from(sectionRef.current.querySelectorAll('[data-cmp-stat]'), {
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
    <section ref={sectionRef} aria-labelledby="cmp-stats-heading" className="space-y-3">
      <h2 id="cmp-stats-heading" className="sr-only">
        Complaint statistics
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <li key={card.key} data-cmp-stat>
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
                <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--nestora-forest)]">{card.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
              </motion.article>
            </li>
          );
        })}
      </ul>
      <div
        data-cmp-stat
        className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card px-4 py-3"
        aria-label="Category hotspot"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--nestora-sage)]">This week</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Highest volume:{' '}
          <span className="font-semibold text-[var(--nestora-forest)]">
            {summary?.categoryHotspot ?? (loading ? '…' : '—')}
          </span>
          <span className="text-muted-foreground"> — staff suggestions pre-filtered on assign.</span>
        </p>
      </div>
    </section>
  );
}
