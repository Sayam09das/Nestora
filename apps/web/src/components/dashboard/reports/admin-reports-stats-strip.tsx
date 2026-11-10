'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Clock, FileSpreadsheet, Layers, Timer, Zap } from 'lucide-react';
import { useMemo, useRef } from 'react';

import { REPORTS_STATS } from '@/components/dashboard/reports/admin-reports-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';

const motionEase = [0.22, 1, 0.36, 1] as const;

export function AdminReportsStatsStrip() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const cards = useMemo(
    () => [
      { key: 'tpl', label: 'Report templates', value: REPORTS_STATS.templates, hint: 'FR-129 – FR-138', icon: Layers, accent: 'var(--nestora-forest)' },
      { key: 'sched', label: 'Scheduled jobs', value: REPORTS_STATS.scheduledJobs, hint: 'Cron + on-demand', icon: Timer, accent: '#0284c7' },
      { key: 'exp', label: 'Exports this week', value: REPORTS_STATS.exportsThisWeek, hint: 'CSV & PDF', icon: FileSpreadsheet, accent: 'var(--nestora-gold)' },
      { key: 'run', label: 'Avg runtime', value: `${REPORTS_STATS.avgRunSeconds}s`, hint: 'Cached aggregates', icon: Zap, accent: '#6d9773' },
      { key: 'fresh', label: 'Data freshness', value: `${REPORTS_STATS.dataFreshnessMin}m`, hint: 'Since last ETL', icon: Clock, accent: 'var(--nestora-sage)' },
    ],
    [],
  );

  useGSAP(
    () => {
      if (reduceMotion || !sectionRef.current) return;
      gsap.from(sectionRef.current.querySelectorAll('[data-rpt-stat]'), {
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
    <section ref={sectionRef} aria-labelledby="rpt-stats-heading" className="space-y-3">
      <h2 id="rpt-stats-heading" className="sr-only">
        Report statistics
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <li key={card.key} data-rpt-stat>
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
