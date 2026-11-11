'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Clock3, UserCheck, Users, UserX } from 'lucide-react';
import { useMemo, useRef } from 'react';

import type { WardenHostelStudentStats } from '@/hooks/use-warden-hostel-student-stats';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

type Props = {
  hostelName: string;
  stats: WardenHostelStudentStats | null;
  loading?: boolean;
};

export function WardenStudentsStatsStrip({ hostelName, stats, loading = false }: Props) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const cards = useMemo(() => {
    const total = stats?.total ?? 0;
    const active = stats?.active ?? 0;
    const pending = stats?.pending ?? 0;
    const inactive = stats?.inactive ?? 0;
    const pct = (n: number) => (total > 0 ? Math.round((n / total) * 1000) / 10 : 0);

    return [
      {
        key: 'total',
        label: 'Directory total',
        value: stats == null && loading ? null : total,
        hint: hostelName,
        delta: 'Hostel-scoped',
        icon: Users,
        accent: 'var(--nestora-forest)',
        surface: 'color-mix(in oklch, var(--nestora-forest) 7%, var(--card))',
        barPct: 100,
        barColor: 'var(--nestora-sage)',
      },
      {
        key: 'active',
        label: 'Active residents',
        value: stats == null && loading ? null : active,
        hint: 'Eligible for allocation & ops',
        delta: `${pct(active)}%`,
        icon: UserCheck,
        accent: '#6d9773',
        surface: 'color-mix(in oklch, var(--nestora-sage) 14%, var(--card))',
        barPct: pct(active),
        barColor: '#6d9773',
      },
      {
        key: 'pending',
        label: 'Tier-2 queue',
        value: stats == null && loading ? null : pending,
        hint: 'Admin verified · warden pending',
        delta: `${pct(pending)}%`,
        icon: Clock3,
        accent: 'var(--nestora-gold)',
        surface: 'color-mix(in oklch, var(--nestora-gold) 16%, var(--card))',
        barPct: pct(pending),
        barColor: 'var(--nestora-gold)',
      },
      {
        key: 'inactive',
        label: 'Inactive',
        value: stats == null && loading ? null : inactive,
        hint: 'Checked out or archived',
        delta: `${pct(inactive)}%`,
        icon: UserX,
        accent: 'var(--muted-foreground)',
        surface: 'color-mix(in oklch, var(--nestora-cream) 22%, var(--card))',
        barPct: pct(inactive),
        barColor: 'color-mix(in oklch, var(--muted-foreground) 55%, var(--border))',
      },
    ] as const;
  }, [stats, loading, hostelName]);

  useGSAP(
    () => {
      if (reduceMotion || !sectionRef.current) return;
      gsap.from(sectionRef.current.querySelectorAll('[data-warden-stat-card]'), {
        opacity: 0,
        y: 14,
        duration: 0.4,
        stagger: 0.07,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: sectionRef, dependencies: [reduceMotion, stats?.total] },
  );

  return (
    <section ref={sectionRef} aria-labelledby="warden-students-stats-heading" className="space-y-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--nestora-sage)]">Occupancy</p>
        <h2 id="warden-students-stats-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
          Hostel resident snapshot
        </h2>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <li key={card.key} data-warden-stat-card>
              <motion.article
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: index * 0.04, ease: motionEase }}
                className={cn(
                  'flex h-full flex-col rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] p-4 shadow-sm',
                )}
                style={{ background: card.surface }}
              >
                <motion.span className="mb-3 flex size-9 items-center justify-center rounded-xl border border-border/80 bg-card/90">
                  <Icon className="size-4" style={{ color: card.accent }} aria-hidden />
                </motion.span>
                <p className="text-2xl font-semibold tabular-nums tracking-tight">
                  {card.value == null ? '—' : card.value.toLocaleString('en-IN')}
                </p>
                <p className="mt-0.5 text-sm font-medium">{card.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#e7e7dc]">
                  <div
                    className="h-full rounded-full transition-[width] duration-500"
                    style={{ width: `${card.barPct}%`, backgroundColor: card.barColor }}
                    role="presentation"
                  />
                </div>
              </motion.article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
