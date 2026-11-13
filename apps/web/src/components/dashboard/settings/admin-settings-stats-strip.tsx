'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { FilePen, Layers, Lock, Shield, Timer } from 'lucide-react';
import { useMemo, useRef } from 'react';

import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import type { SettingsDeskSummary } from '@/lib/api/settings';
import { liveMetricNumber, liveMetricText } from '@/lib/api/live-metric';

const motionEase = [0.22, 1, 0.36, 1] as const;

type Props = { summary?: SettingsDeskSummary | null; loading?: boolean };

export function AdminSettingsStatsStrip({ summary, loading }: Props) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const cards = useMemo(() => {
    const s = summary;
    return [
      {
        key: 'pan',
        label: 'Config panels',
        value: liveMetricNumber(s?.panels, loading),
        hint: 'Modular domains',
        icon: Layers,
        accent: 'var(--nestora-forest)',
      },
      {
        key: 'draft',
        label: 'Open drafts',
        value: liveMetricNumber(s?.pendingDrafts, loading),
        hint: 'Needs review',
        icon: FilePen,
        accent: 'var(--nestora-gold)',
      },
      {
        key: 'lock',
        label: 'Locked controls',
        value: liveMetricNumber(s?.criticalLocks, loading),
        hint: 'FR-121',
        icon: Lock,
        accent: '#dc2626',
      },
      {
        key: 'env',
        label: 'Policy tier',
        value: s?.policyTier ?? 'Tier 1',
        hint: 'University admin',
        icon: Shield,
        accent: '#7c3aed',
      },
      {
        key: 'pub',
        label: 'Last publish',
        value: `${liveMetricNumber(s?.lastPublishHours, loading)}h`,
        hint: 'Live audit trail',
        icon: Timer,
        accent: 'var(--nestora-sage)',
      },
    ];
  }, [loading, summary]);

  useGSAP(
    () => {
      if (reduceMotion || !sectionRef.current) return;
      gsap.from(sectionRef.current.querySelectorAll('[data-set-stat]'), {
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
    <section ref={sectionRef} aria-labelledby="set-stats-heading" className="space-y-3">
      <h2 id="set-stats-heading" className="sr-only">
        Settings statistics
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <li key={card.key} data-set-stat>
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
