'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, ClipboardCheck, Moon, UserCheck, UserX } from 'lucide-react';
import { useMemo, useRef } from 'react';

import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import type { NightAttendanceSummary } from '@/lib/api/attendance';

const motionEase = [0.22, 1, 0.36, 1] as const;

type Props = {
  summary: NightAttendanceSummary | null;
  loading?: boolean;
};

export function AdminAttendanceStatsStrip({ summary, loading = false }: Props) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const cards = useMemo(
    () => [
      {
        key: 'rate',
        label: 'Tonight’s rate',
        value: summary?.todayRatePct != null ? `${summary.todayRatePct}%` : loading ? '…' : '—',
        hint: `${summary?.residentsTotal ?? (loading ? '…' : 0)} residents`,
        icon: ClipboardCheck,
        accent: 'var(--nestora-forest)',
      },
      {
        key: 'present',
        label: 'Present',
        value: summary?.presentToday ?? (loading ? '…' : 0),
        hint: 'Checked in roster',
        icon: UserCheck,
        accent: '#6d9773',
      },
      {
        key: 'absent',
        label: 'Absent',
        value: summary?.absentToday ?? (loading ? '…' : 0),
        hint: `${summary?.unexplainedAbsent ?? 0} unexplained`,
        icon: UserX,
        accent: 'var(--destructive)',
      },
      {
        key: 'leave',
        label: 'On leave',
        value: summary?.onLeaveToday ?? (loading ? '…' : 0),
        hint: 'Auto from approved leave',
        icon: Moon,
        accent: 'var(--nestora-sage)',
      },
      {
        key: 'disputes',
        label: 'Disputes open',
        value: summary?.openDisputes ?? (loading ? '…' : 0),
        hint: 'Student discrepancy reports',
        icon: AlertTriangle,
        accent: 'var(--nestora-gold)',
      },
    ],
    [summary, loading],
  );

  const progressWidth = summary?.todayRatePct ?? 0;

  useGSAP(
    () => {
      if (reduceMotion || !sectionRef.current) return;
      gsap.from(sectionRef.current.querySelectorAll('[data-att-stat]'), {
        opacity: 0,
        y: 14,
        stagger: { each: 0.06, grid: 'auto' },
        duration: 0.4,
        ease: 'back.out(1.1)',
        clearProps: 'opacity,transform',
      });
    },
    { scope: sectionRef, dependencies: [reduceMotion] },
  );

  return (
    <section ref={sectionRef} aria-labelledby="att-stats-heading" className="space-y-3">
      <h2 id="att-stats-heading" className="sr-only">
        Attendance statistics
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <li key={card.key} data-att-stat>
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
      <motion.div
        data-att-stat
        initial={reduceMotion ? false : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, ease: motionEase }}
        className="h-2 origin-left overflow-hidden rounded-full bg-[#e7e7dc]"
        aria-hidden
      >
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#6d9773,var(--nestora-forest))] transition-[width] duration-500"
          style={{ width: `${progressWidth}%` }}
        />
      </motion.div>
    </section>
  );
}
