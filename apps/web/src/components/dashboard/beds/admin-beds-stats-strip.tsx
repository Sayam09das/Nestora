'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Bed, BedDouble, Bookmark, Hammer, TrendingUp, UserCheck } from 'lucide-react';
import { useMemo, useRef } from 'react';

import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import type { BedDirectorySummary } from '@/lib/api/beds';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;
const BAR_GREEN = '#6d9773';
const BAR_GOLD = '#ffba00';
const BAR_MUTED = 'color-mix(in oklch, var(--muted-foreground) 55%, var(--border))';

type AdminBedsStatsStripProps = {
  summary: BedDirectorySummary | null;
  loading?: boolean;
};

export function AdminBedsStatsStrip({ summary, loading = false }: AdminBedsStatsStripProps) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const { stats, occupancyPct, stackWidth, byHostel } = useMemo(() => {
    const total = summary?.totalBeds ?? 0;
    const pct = (n: number) => (total > 0 ? Math.round((n / total) * 1000) / 10 : 0);
    const occupied = summary?.occupied ?? 0;
    const available = summary?.available ?? 0;
    const reserved = summary?.reserved ?? 0;
    const maintenance = summary?.maintenance ?? 0;
    const occRate = summary?.occupiedRatePercent ?? (total > 0 ? pct(occupied) : 0);

    return {
      occupancyPct: occRate,
      byHostel: summary?.byHostel ?? [],
      stats: [
        {
          key: 'total',
          label: 'Total Beds',
          value: total,
          hint: 'Registered inventory',
          delta: 'All hostels',
          icon: BedDouble,
          accent: 'var(--nestora-forest)',
          surface: 'color-mix(in oklch, var(--nestora-forest) 7%, var(--card))',
          barPct: 100,
          barColor: 'var(--nestora-sage)',
        },
        {
          key: 'occupied',
          label: 'Occupied',
          value: occupied,
          hint: 'Assigned to students',
          delta: `${pct(occupied)}%`,
          icon: UserCheck,
          accent: BAR_GREEN,
          surface: 'color-mix(in oklch, var(--nestora-sage) 14%, var(--card))',
          barPct: pct(occupied),
          barColor: BAR_GREEN,
        },
        {
          key: 'available',
          label: 'Available',
          value: available,
          hint: 'Ready for allocation',
          delta: `${pct(available)}%`,
          icon: Bed,
          accent: 'var(--nestora-sage)',
          surface: 'color-mix(in oklch, var(--nestora-sage-light) 22%, var(--card))',
          barPct: pct(available),
          barColor: BAR_GREEN,
        },
        {
          key: 'reserved',
          label: 'Reserved',
          value: reserved,
          hint: 'Held for upcoming move',
          delta: `${pct(reserved)}%`,
          icon: Bookmark,
          accent: BAR_GOLD,
          surface: 'color-mix(in oklch, var(--nestora-gold) 14%, var(--card))',
          barPct: pct(reserved),
          barColor: BAR_GOLD,
        },
        {
          key: 'maintenance',
          label: 'Maintenance',
          value: maintenance,
          hint: 'Repair in progress',
          delta: `${pct(maintenance)}%`,
          icon: Hammer,
          accent: 'var(--muted-foreground)',
          surface: 'color-mix(in oklch, var(--nestora-cream) 22%, var(--card))',
          barPct: pct(maintenance),
          barColor: BAR_MUTED,
        },
      ] as const,
      stackWidth: {
        occupied: total > 0 ? (occupied / total) * 100 : 0,
        reserved: total > 0 ? (reserved / total) * 100 : 0,
        maintenance: total > 0 ? (maintenance / total) * 100 : 0,
        available: total > 0 ? (available / total) * 100 : 0,
      },
    };
  }, [summary]);

  useGSAP(
    () => {
      if (reduceMotion || !sectionRef.current) {
        return;
      }
      gsap.from(sectionRef.current.querySelectorAll('[data-beds-stat-card]'), {
        opacity: 0,
        y: 16,
        duration: 0.42,
        stagger: { each: 0.06, from: 'start', grid: 'auto' },
        ease: 'back.out(1.1)',
        clearProps: 'opacity,transform',
      });
      gsap.from(sectionRef.current.querySelectorAll('[data-beds-stat-bar]'), {
        scaleX: 0,
        duration: 0.65,
        stagger: 0.05,
        delay: 0.1,
        ease: 'power3.out',
        transformOrigin: 'left center',
        clearProps: 'transform',
      });
    },
    { scope: sectionRef, dependencies: [reduceMotion] },
  );

  return (
    <section ref={sectionRef} aria-labelledby="beds-summary-heading" className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--nestora-sage)]">Inventory</p>
          <h2 id="beds-summary-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
            Bed-level snapshot
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Overall occupancy{' '}
          <span className="font-semibold tabular-nums text-[var(--nestora-forest)]">
            {loading ? '—' : `${occupancyPct}%`}
          </span>
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <li key={stat.key} data-beds-stat-card>
              <motion.article
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.04, ease: motionEase }}
                whileHover={reduceMotion ? undefined : { y: -3 }}
                className={cn(
                  'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] p-3.5 shadow-sm',
                  'transition-[border-color,box-shadow] duration-200 hover:border-[color-mix(in_oklch,var(--nestora-sage)_36%,var(--border))] hover:shadow-md',
                )}
                style={{ background: stat.surface }}
              >
                <div className="relative mb-2 flex items-start justify-between gap-2">
                  <span className="flex size-9 items-center justify-center rounded-xl border border-[var(--nestora-sage-muted)] bg-card/90">
                    <Icon className="size-4" style={{ color: stat.accent }} aria-hidden />
                  </span>
                  {stat.key === 'occupied' ? (
                    <span className="inline-flex items-center gap-0.5 rounded-full border border-border/80 bg-card/85 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      <TrendingUp className="size-3 text-[#6d9773]" aria-hidden />
                      {loading ? '—' : stat.delta}
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      {loading ? '—' : stat.delta}
                    </span>
                  )}
                </div>
                <p className="text-xl font-semibold tabular-nums tracking-tight text-foreground">
                  {loading ? '—' : stat.value.toLocaleString('en-IN')}
                </p>
                <p className="mt-0.5 text-sm font-medium text-foreground">{stat.label}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{stat.hint}</p>
                <div className="relative mt-2 h-1 overflow-hidden rounded-full bg-[#e7e7dc]">
                  <div
                    data-beds-stat-bar
                    className="h-full origin-left rounded-full"
                    style={{ width: loading ? '0%' : `${stat.barPct}%`, backgroundColor: stat.barColor }}
                  />
                </div>
              </motion.article>
            </li>
          );
        })}
      </ul>

      <div className="grid gap-3 lg:grid-cols-2">
        <div
          className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card p-4"
          aria-label="Overall bed occupancy"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--nestora-sage)]">Overall bed occupancy</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-[var(--nestora-forest)]">
            {loading ? '—' : `${occupancyPct}%`}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold tabular-nums text-foreground">
              {loading ? '—' : (summary?.occupied ?? 0).toLocaleString('en-IN')}
            </span>{' '}
            / {loading ? '—' : (summary?.totalBeds ?? 0).toLocaleString('en-IN')} occupied
          </p>
          <div
            className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-[#e7e7dc]"
            role="img"
            aria-label="Occupied, reserved, maintenance, and available beds"
          >
            <motion.div
              data-beds-stat-bar
              className="h-full origin-left bg-[#6d9773]"
              style={{ width: loading ? '0%' : `${stackWidth.occupied}%` }}
              layout={!reduceMotion}
            />
            <motion.div
              data-beds-stat-bar
              className="h-full origin-left bg-[#ffba00]"
              style={{ width: loading ? '0%' : `${stackWidth.reserved}%` }}
            />
            <div
              className="h-full shrink-0 bg-[color-mix(in_oklch,var(--muted-foreground)_45%,var(--border))]"
              style={{ width: loading ? '0%' : `${stackWidth.maintenance}%` }}
            />
            <div
              className="h-full shrink-0 bg-[color-mix(in_oklch,var(--nestora-sage-light)_70%,var(--card))]"
              style={{ width: loading ? '0%' : `${stackWidth.available}%` }}
            />
          </div>
          <ul className="mt-2 flex flex-wrap gap-3 text-[10px] font-medium text-muted-foreground">
            <li className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-[#6d9773]" /> Occupied
            </li>
            <li className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-[#ffba00]" /> Reserved
            </li>
            <li className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-[color-mix(in_oklch,var(--muted-foreground)_50%,var(--border))]" />{' '}
              Maintenance
            </li>
            <li className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-[color-mix(in_oklch,var(--nestora-sage)_55%,var(--card))]" />{' '}
              Available
            </li>
          </ul>
        </div>

        <div
          className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-cream)_15%,var(--card))] p-4"
          aria-label="Hostel-wise availability"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--nestora-sage)]">Hostel availability</p>
          {byHostel.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">{loading ? 'Loading…' : 'No hostel bed data yet.'}</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {byHostel.map((row) => {
                const openPct = row.total > 0 ? Math.round((row.available / row.total) * 1000) / 10 : 0;
                return (
                  <li key={row.hostel} data-beds-stat-card className="space-y-1.5">
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span className="font-medium text-foreground">{row.hostel}</span>
                      <span className="text-xs text-muted-foreground">
                        <span className="font-semibold tabular-nums text-[var(--nestora-forest)]">{row.available}</span>{' '}
                        open · {row.total} beds
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[#e7e7dc]">
                      <div
                        data-beds-stat-bar
                        className="h-full origin-left rounded-full bg-[#6d9773]"
                        style={{ width: `${openPct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
