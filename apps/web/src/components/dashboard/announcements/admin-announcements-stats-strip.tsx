'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, CalendarClock, CheckCircle2, Megaphone, Radio } from 'lucide-react';
import { useMemo, useRef } from 'react';

import { ANNOUNCEMENT_STATS } from '@/components/dashboard/announcements/admin-announcements-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';

const motionEase = [0.22, 1, 0.36, 1] as const;

export function AdminAnnouncementsStatsStrip() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const cards = useMemo(
    () => [
      { key: 'live', label: 'Live now', value: ANNOUNCEMENT_STATS.liveNow, hint: 'On student dashboards', icon: Radio, accent: 'var(--nestora-forest)' },
      { key: 'sched', label: 'Scheduled', value: ANNOUNCEMENT_STATS.scheduled, hint: 'Auto-publish queued', icon: CalendarClock, accent: '#0284c7' },
      { key: 'ack', label: 'Acks pending', value: ANNOUNCEMENT_STATS.ackPending, hint: 'FR-089 roster', icon: CheckCircle2, accent: 'var(--nestora-gold)' },
      { key: 'rate', label: 'Read rate', value: `${ANNOUNCEMENT_STATS.avgReadRate}%`, hint: 'Mandatory notices', icon: Megaphone, accent: '#6d9773' },
      { key: 'emg', label: 'Emergency live', value: ANNOUNCEMENT_STATS.emergencyActive, hint: 'Cannot be muted', icon: AlertTriangle, accent: '#dc2626' },
    ],
    [],
  );

  useGSAP(
    () => {
      if (reduceMotion || !sectionRef.current) return;
      gsap.from(sectionRef.current.querySelectorAll('[data-ann-stat]'), {
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
    <section ref={sectionRef} aria-labelledby="ann-stats-heading" className="space-y-3">
      <h2 id="ann-stats-heading" className="sr-only">
        Announcement statistics
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <li key={card.key} data-ann-stat>
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
