'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Eye, FileArchive, Lock, ShieldCheck, Timer } from 'lucide-react';
import { useMemo, useRef } from 'react';

import { AUDIT_STATS } from '@/components/dashboard/audit-logs/admin-audit-logs-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';

const motionEase = [0.22, 1, 0.36, 1] as const;

export function AdminAuditLogsStatsStrip() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const cards = useMemo(
    () => [
      { key: 'imm', label: 'Tamper-proof', value: 'WORM', hint: 'FR-140+', icon: Lock, accent: 'var(--nestora-forest)' },
      { key: '24h', label: 'Last 24 hours', value: AUDIT_STATS.entries24h, hint: 'All modules', icon: Timer, accent: 'var(--nestora-sage)' },
      { key: 'sens', label: 'Sensitive views', value: AUDIT_STATS.sensitiveViews, hint: 'FR-144', icon: Eye, accent: '#dc2626' },
      { key: 'exp', label: 'Exports', value: AUDIT_STATS.exportsWeek, hint: 'This week', icon: FileArchive, accent: 'var(--nestora-gold)' },
      { key: 'ver', label: 'Chain verify', value: 'OK', hint: 'Hash checks', icon: ShieldCheck, accent: '#0284c7' },
    ],
    [],
  );

  useGSAP(
    () => {
      if (reduceMotion || !sectionRef.current) return;
      gsap.from(sectionRef.current.querySelectorAll('[data-aud-stat]'), {
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
    <section ref={sectionRef} aria-labelledby="aud-stats-heading" className="space-y-3">
      <h2 id="aud-stats-heading" className="sr-only">
        Audit statistics
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <li key={card.key} data-aud-stat>
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
