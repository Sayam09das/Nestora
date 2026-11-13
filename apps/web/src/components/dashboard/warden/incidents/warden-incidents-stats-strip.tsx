'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, BellRing, CheckCircle2, Flame, ShieldAlert } from 'lucide-react';
import { useMemo, useRef } from 'react';

import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import type { IncidentsDeskSummary } from '@/lib/api/incidents';

const motionEase = [0.22, 1, 0.36, 1] as const;

type Props = {
  summary: IncidentsDeskSummary | null;
  loading?: boolean;
};

export function WardenIncidentsStatsStrip({ summary, loading = false }: Props) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const cards = useMemo(
    () => [
      {
        key: 'active',
        label: 'Active incidents',
        value: summary?.activeIncidents ?? (loading ? '…' : 0),
        hint: 'Open emergency reports',
        icon: Flame,
        accent: '#dc2626',
      },
      {
        key: 'unack',
        label: 'Awaiting ack',
        value: summary?.unacknowledged ?? (loading ? '…' : 0),
        hint: 'Need warden response',
        icon: BellRing,
        accent: 'var(--nestora-gold)',
      },
      {
        key: 'critical',
        label: 'High / critical',
        value: summary?.criticalOpen ?? (loading ? '…' : 0),
        hint: 'Escalation watchlist',
        icon: ShieldAlert,
        accent: '#7c2d12',
      },
      {
        key: 'escalated',
        label: 'Auto-escalated',
        value: summary?.escalated ?? (loading ? '…' : 0),
        hint: 'Admin notified',
        icon: AlertTriangle,
        accent: '#9333ea',
      },
      {
        key: 'resolved',
        label: 'Resolved (7d)',
        value: summary?.resolvedThisWeek ?? (loading ? '…' : 0),
        hint: 'Closed with notes',
        icon: CheckCircle2,
        accent: '#6d9773',
      },
    ],
    [summary, loading],
  );

  useGSAP(
    () => {
      if (reduceMotion || !sectionRef.current) return;
      gsap.from(sectionRef.current.querySelectorAll('[data-inc-stat]'), {
        opacity: 0,
        y: 10,
        stagger: 0.05,
        duration: 0.38,
        clearProps: 'opacity,transform',
      });
    },
    { scope: sectionRef, dependencies: [reduceMotion] },
  );

  return (
    <section ref={sectionRef} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5" aria-label="Incident metrics">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <motion.article
            key={card.key}
            data-inc-stat
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: motionEase }}
            className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{card.label}</p>
              <Icon className="size-4" style={{ color: card.accent }} aria-hidden />
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--nestora-forest)]">{card.value}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{card.hint}</p>
          </motion.article>
        );
      })}
    </section>
  );
}
