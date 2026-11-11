'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { BedDouble, CalendarCheck, CalendarDays, CreditCard, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useRef } from 'react';

import {
  formatInr,
  type StudentDashboardSnapshot,
} from '@/components/dashboard/student-portal/home/student-dashboard-data';
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
  href: string;
  icon: LucideIcon;
  accent: string;
};

type Props = { snapshot: StudentDashboardSnapshot; showFees: boolean; loading?: boolean };

export function StudentDashboardKpiStrip({ snapshot, showFees, loading = false }: Props) {
  const reduceMotion = useReducedMotion();
  const stripRef = useRef<HTMLDivElement>(null);

  const cards = useMemo(() => {
    const base: KpiCard[] = [
      {
        id: 'room',
        label: 'My Room',
        value: snapshot.roomNumber === '—' && loading ? '…' : snapshot.roomNumber,
        hint:
          snapshot.bedNumber === '—'
            ? 'Awaiting room allocation'
            : `Bed ${snapshot.bedNumber} · ${snapshot.block}`,
        href: '/student/room',
        icon: BedDouble,
        accent: 'var(--nestora-forest)',
      },
      {
        id: 'attendance',
        label: 'Attendance',
        value:
          snapshot.attendanceMonth && snapshot.attendancePresent + snapshot.attendanceAbsent + snapshot.attendanceLeave === 0
            ? '—'
            : `${snapshot.attendancePercent}%`,
        hint: 'This month',
        href: '/student/attendance',
        icon: CalendarCheck,
        accent: 'var(--nestora-sage)',
      },
      {
        id: 'leave',
        label: 'Leave Requests',
        value: String(snapshot.leaveTotal).padStart(2, '0'),
        hint: `${snapshot.leavePending} pending · ${snapshot.leaveApproved} approved`,
        href: '/student/leave',
        icon: CalendarDays,
        accent: 'var(--nestora-gold)',
      },
    ];
    if (showFees) {
      base.push({
        id: 'fees',
        label: 'Pending Fees',
        value: formatInr(snapshot.feesOutstanding),
        hint: 'Outstanding balance',
        href: '/student/fees',
        icon: CreditCard,
        accent: '#c2410c',
      });
    }
    return base;
  }, [showFees, snapshot]);

  useGSAP(
    () => {
      if (reduceMotion || !stripRef.current) return;
      gsap.from(stripRef.current.querySelectorAll('[data-student-kpi]'), {
        opacity: 0,
        y: 16,
        duration: 0.42,
        stagger: 0.07,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: stripRef, dependencies: [reduceMotion, showFees] },
  );

  return (
    <div
      ref={stripRef}
      className={cn(
        'grid gap-3',
        cards.length === 4 ? 'sm:grid-cols-2 xl:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3',
      )}
      role="list"
      aria-label="Hostel overview statistics"
    >
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.id}
            data-student-kpi
            role="listitem"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.32, ease: motionEase }}
          >
            <Link
              href={card.href}
              className={cn(
                'group flex h-full flex-col rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card p-4 shadow-sm transition-shadow hover:shadow-md',
                focusRing,
              )}
            >
              <span
                className="flex size-10 items-center justify-center rounded-xl border border-[color-mix(in_oklch,var(--nestora-sage)_15%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-cream)_25%,var(--muted))]"
                style={{ color: card.accent }}
                aria-hidden
              >
                <Icon className="size-5" />
              </span>
              <p
                className={cn(
                  'mt-3 font-semibold tracking-tight text-[var(--nestora-forest)] tabular-nums',
                  card.id === 'fees' ? 'text-2xl' : 'text-3xl',
                )}
              >
                {card.value}
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
