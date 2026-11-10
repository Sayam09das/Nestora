'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, BedDouble, Loader2, TrendingUp, UserCog, Users } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useRef } from 'react';

import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import type { AdminDashboardOverview } from '@/lib/api/dashboard';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type StatCard = {
  id: string;
  label: string;
  value: string;
  hint: string;
  delta: string;
  showTrendUp: boolean;
  icon: typeof Users;
  href: string;
  accent: string;
  surface: string;
};

function buildStatCards(overview: AdminDashboardOverview | null): StatCard[] {
  const students = overview?.students;
  const staff = overview?.staff.active ?? 0;
  const rooms = overview?.infrastructure.rooms ?? 0;
  const hostels = overview?.infrastructure.hostels ?? 0;
  const occupancy = overview?.occupancy;
  const occupiedBeds = occupancy?.occupiedBeds ?? 0;
  const availableBeds = occupancy?.availableBeds ?? 0;
  const occupancyPercent = occupancy?.percent;

  const studentDelta =
    students?.monthOverMonthPercent == null
      ? '—'
      : students.monthOverMonthPercent >= 0
        ? `+${students.monthOverMonthPercent}%`
        : `${students.monthOverMonthPercent}%`;

  const studentHint =
    students == null
      ? 'Loading…'
      : students.createdThisMonth === 0
        ? 'No new students this month'
        : students.createdThisMonth === 1
          ? '+1 this month'
          : `+${students.createdThisMonth} this month`;

  const roomDelta =
    occupancyPercent == null
      ? rooms === 0
        ? 'No rooms'
        : '—'
      : `${occupancyPercent}% full`;

  return [
    {
      id: 'students',
      label: 'Total Students',
      value: students == null ? '—' : String(students.active),
      hint: studentHint,
      delta: studentDelta,
      showTrendUp: (students?.monthOverMonthPercent ?? 0) > 0,
      icon: Users,
      href: '/admin/students',
      accent: 'var(--nestora-sage)',
      surface: 'color-mix(in oklch, var(--nestora-sage) 12%, var(--card))',
    },
    {
      id: 'staff',
      label: 'Staff & Wardens',
      value: overview == null ? '—' : String(staff),
      hint: hostels === 1 ? 'Across 1 active hostel' : `Across ${hostels} active hostels`,
      delta: staff === 0 ? 'No staff yet' : 'Live',
      showTrendUp: false,
      icon: UserCog,
      href: '/admin/staff',
      accent: 'var(--nestora-forest)',
      surface: 'color-mix(in oklch, var(--nestora-forest) 8%, var(--card))',
    },
    {
      id: 'rooms',
      label: 'Total Rooms',
      value: overview == null ? '—' : String(rooms),
      hint:
        occupiedBeds === 0
          ? 'No occupied beds'
          : occupiedBeds === 1
            ? '1 bed occupied'
            : `${occupiedBeds} beds occupied`,
      delta: roomDelta,
      showTrendUp: false,
      icon: BedDouble,
      href: '/admin/rooms',
      accent: 'var(--nestora-tan)',
      surface: 'color-mix(in oklch, var(--nestora-tan) 12%, var(--card))',
    },
    {
      id: 'beds',
      label: 'Available Beds',
      value: overview == null ? '—' : String(availableBeds),
      hint: 'Current availability',
      delta: availableBeds > 0 ? 'Open now' : 'None free',
      showTrendUp: false,
      icon: BedDouble,
      href: '/admin/allocation',
      accent: 'var(--nestora-gold)',
      surface: 'color-mix(in oklch, var(--nestora-gold) 14%, var(--card))',
    },
  ];
}

type AdminDashboardStatsStripProps = {
  overview: AdminDashboardOverview | null;
  loading?: boolean;
};

export function AdminDashboardStatsStrip({ overview, loading = false }: AdminDashboardStatsStripProps) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const stats = useMemo(() => buildStatCards(overview), [overview]);

  useGSAP(
    () => {
      if (reduceMotion || !sectionRef.current) {
        return;
      }
      gsap.from(sectionRef.current.querySelectorAll('[data-stat-card]'), {
        opacity: 0,
        y: 14,
        duration: 0.38,
        stagger: { each: 0.06, from: 'start', grid: 'auto' },
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: sectionRef, dependencies: [reduceMotion, stats.length] },
  );

  return (
    <section ref={sectionRef} aria-labelledby="admin-stats-heading" className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--nestora-sage)]">
            Overview
          </p>
          <h2 id="admin-stats-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
            Key metrics
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">Tap a card to open the module</p>
      </div>

      {loading && !overview ? (
        <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
          Loading key metrics…
        </p>
      ) : null}

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <li key={stat.id} data-admin-dash-card data-stat-card>
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05, ease: motionEase }}
              >
                <Link
                  href={stat.href}
                  className={cn(
                    'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] p-4 shadow-sm',
                    'transition-[border-color,box-shadow] duration-200 hover:border-[color-mix(in_oklch,var(--nestora-sage)_38%,var(--border))] hover:shadow-md',
                    focusRing,
                  )}
                  style={{ background: stat.surface }}
                >
                  <span
                    className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full opacity-25 blur-2xl"
                    style={{ background: stat.accent }}
                    aria-hidden
                  />
                  <div className="relative mb-3 flex items-start justify-between gap-2">
                    <span className="flex size-10 items-center justify-center rounded-xl border border-[var(--nestora-sage-muted)] bg-card text-[var(--nestora-forest)] shadow-sm">
                      <Icon className="size-4" style={{ color: stat.accent }} aria-hidden />
                    </span>
                    <span className="inline-flex items-center gap-0.5 rounded-full border border-border/80 bg-card/80 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      {stat.showTrendUp ? (
                        <TrendingUp className="size-3 text-[var(--nestora-sage)]" aria-hidden />
                      ) : null}
                      {stat.delta}
                    </span>
                  </div>
                  <p className="relative text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                    {stat.value}
                  </p>
                  <p className="relative mt-0.5 text-sm font-medium text-foreground">{stat.label}</p>
                  <p className="relative mt-1 text-xs text-muted-foreground">{stat.hint}</p>
                  <ArrowUpRight
                    className="absolute bottom-3 right-3 size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden
                  />
                </Link>
              </motion.div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
