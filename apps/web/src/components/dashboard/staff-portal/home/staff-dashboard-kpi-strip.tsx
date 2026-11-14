'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, ClipboardList, LoaderCircle, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

import type { StaffDashboardSnapshot } from '@/components/dashboard/staff-portal/home/staff-dashboard-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;
const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type KpiCard = {
  id: string;
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  accent: string;
};

type Props = { snapshot: StaffDashboardSnapshot; loading?: boolean };

export function StaffDashboardKpiStrip({ snapshot, loading }: Props) {
  const reduceMotion = useReducedMotion();
  const stripRef = useRef<HTMLDivElement>(null);
  const { kpis } = snapshot;

  const cards: KpiCard[] = [
    {
      id: 'assigned',
      label: 'Assigned Tasks',
      value: kpis.assigned,
      hint: "Today's workload",
      icon: ClipboardList,
      accent: 'var(--nestora-sage)',
    },
    {
      id: 'completed',
      label: 'Completed',
      value: kpis.completed,
      hint: 'Tasks finished',
      icon: CheckCircle2,
      accent: 'var(--nestora-forest)',
    },
    {
      id: 'progress',
      label: 'In Progress',
      value: kpis.inProgress,
      hint: 'Currently working',
      icon: LoaderCircle,
      accent: 'var(--nestora-gold)',
    },
    {
      id: 'overdue',
      label: 'Overdue',
      value: kpis.overdue,
      hint: 'Needs attention',
      icon: AlertTriangle,
      accent: '#c2410c',
    },
  ];

  useGSAP(
    () => {
      if (reduceMotion || !stripRef.current) return;
      gsap.from(stripRef.current.querySelectorAll('[data-staff-kpi]'), {
        opacity: 0,
        y: 16,
        duration: 0.42,
        stagger: 0.07,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: stripRef, dependencies: [reduceMotion] },
  );

  return (
    <div ref={stripRef} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" role="list" aria-label="Today's work overview">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.id}
            data-staff-kpi
            role="listitem"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.32, ease: motionEase }}
          >
            <Link
              href="/staff/tasks"
              className={cn(
                'group flex h-full flex-col rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card p-4 shadow-sm transition-shadow hover:shadow-md',
                focusRing,
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className="flex size-10 items-center justify-center rounded-xl border border-[color-mix(in_oklch,var(--nestora-sage)_15%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-cream)_25%,var(--muted))]"
                  style={{ color: card.accent }}
                  aria-hidden
                >
                  <Icon className="size-5" />
                </span>
              </div>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--nestora-forest)] tabular-nums">
                {loading ? '…' : String(card.value).padStart(2, '0')}
              </p>
              <p className="mt-0.5 text-sm font-medium text-foreground">{card.label}</p>
              <p className="text-xs text-muted-foreground">{card.hint}</p>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
