'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  BedDouble,
  ClipboardCheck,
  MessageSquareWarning,
  Plane,
  Users,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useRef } from 'react';

import type { WardenDashboardSnapshot } from '@/components/dashboard/warden/home/warden-dashboard-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type KpiCard = {
  id: string;
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  href: string;
  accent: string;
};

function buildKpis(snapshot: WardenDashboardSnapshot): KpiCard[] {
  const { kpis } = snapshot;
  return [
    {
      id: 'students',
      label: 'Students',
      value: String(kpis.students.value),
      hint: kpis.students.hint,
      icon: Users,
      href: '/warden/students',
      accent: 'var(--nestora-sage)',
    },
    {
      id: 'occupancy',
      label: 'Occupancy',
      value: `${kpis.occupancy.percent}%`,
      hint: `${kpis.occupancy.occupied} / ${kpis.occupancy.total} beds`,
      icon: BedDouble,
      href: '/warden/rooms',
      accent: 'var(--nestora-tan)',
    },
    {
      id: 'present',
      label: 'Present Today',
      value: String(kpis.presentToday.value),
      hint: `${kpis.presentToday.percent}% of students`,
      icon: ClipboardCheck,
      href: '/warden/attendance',
      accent: 'var(--nestora-forest)',
    },
    {
      id: 'leave',
      label: 'Leave Requests',
      value: String(kpis.leaveRequests.value).padStart(2, '0'),
      hint: kpis.leaveRequests.hint,
      icon: Plane,
      href: '/warden/leave',
      accent: 'var(--nestora-gold)',
    },
    {
      id: 'complaints',
      label: 'Complaints',
      value: String(kpis.complaints.value).padStart(2, '0'),
      hint: kpis.complaints.hint,
      icon: MessageSquareWarning,
      href: '/warden/complaints',
      accent: 'var(--destructive)',
    },
  ];
}

type Props = { snapshot: WardenDashboardSnapshot; loading?: boolean };

export function WardenDashboardKpiStrip({ snapshot, loading = false }: Props) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const cards = useMemo(() => buildKpis(snapshot), [snapshot]);

  useGSAP(
    () => {
      if (reduceMotion || !sectionRef.current) return;
      gsap.from(sectionRef.current.querySelectorAll('[data-warden-kpi]'), {
        opacity: 0,
        y: 12,
        duration: 0.36,
        stagger: 0.05,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: sectionRef, dependencies: [reduceMotion, cards.length] },
  );

  return (
    <section ref={sectionRef} aria-label="Overview statistics" className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--nestora-sage)]">Overview statistics</p>
      <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <li key={card.id} data-warden-kpi>
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: index * 0.04, ease: motionEase }}
              >
                <Link
                  href={card.href}
                  className={cn(
                    'flex h-full flex-col rounded-xl border border-[color-mix(in_oklch,var(--nestora-sage)_16%,var(--border))] bg-card p-3.5 shadow-sm',
                    'transition-[border-color,box-shadow] hover:border-[color-mix(in_oklch,var(--nestora-sage)_32%,var(--border))] hover:shadow-md',
                    focusRing,
                  )}
                >
                  <motion.div className="mb-2 flex items-center justify-between gap-2">
                    <span
                      className="flex size-8 items-center justify-center rounded-lg border border-border/70 bg-muted/40"
                      aria-hidden
                    >
                      <Icon className="size-3.5" style={{ color: card.accent }} />
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {card.label}
                    </span>
                  </motion.div>
                  <p className="text-xl font-semibold tabular-nums tracking-tight text-foreground">
                    {loading ? '—' : card.value}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{card.hint}</p>
                </Link>
              </motion.div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
