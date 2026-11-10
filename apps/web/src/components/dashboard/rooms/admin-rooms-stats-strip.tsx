'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { BedDouble, Building2, Hammer, LayoutGrid, TrendingUp } from 'lucide-react';
import { useMemo, useRef } from 'react';

import { ROOM_DIRECTORY_STATS } from '@/components/dashboard/rooms/admin-rooms-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;
const BAR_GREEN = '#6d9773';
const BAR_GOLD = '#ffba00';

export function AdminRoomsStatsStrip() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const { roomStats, bedStats } = useMemo(() => {
    const total = ROOM_DIRECTORY_STATS.totalRooms;
    const occupiedPct = Math.round((ROOM_DIRECTORY_STATS.occupiedRooms / total) * 1000) / 10;
    const availablePct = Math.round((ROOM_DIRECTORY_STATS.availableRooms / total) * 1000) / 10;
    const maintenancePct = Math.round((ROOM_DIRECTORY_STATS.maintenanceRooms / total) * 1000) / 10;

    const bedTotal = ROOM_DIRECTORY_STATS.totalBeds;
    const bedOccPct = Math.round((ROOM_DIRECTORY_STATS.occupiedBeds / bedTotal) * 1000) / 10;
    const bedAvailPct = Math.round((ROOM_DIRECTORY_STATS.availableBeds / bedTotal) * 1000) / 10;

    return {
      roomStats: [
        {
          key: 'total',
          label: 'Total Rooms',
          value: ROOM_DIRECTORY_STATS.totalRooms,
          hint: 'All registered rooms',
          delta: 'All blocks',
          icon: LayoutGrid,
          accent: 'var(--nestora-forest)',
          surface: 'color-mix(in oklch, var(--nestora-forest) 7%, var(--card))',
          barPct: 100,
          barColor: 'var(--nestora-sage)',
        },
        {
          key: 'occupied',
          label: 'Occupied',
          value: ROOM_DIRECTORY_STATS.occupiedRooms,
          hint: 'Every bed allocated',
          delta: `${occupiedPct}%`,
          icon: Building2,
          accent: BAR_GREEN,
          surface: 'color-mix(in oklch, var(--nestora-sage) 14%, var(--card))',
          barPct: occupiedPct,
          barColor: BAR_GREEN,
        },
        {
          key: 'available',
          label: 'Available',
          value: ROOM_DIRECTORY_STATS.availableRooms,
          hint: 'At least one open bed',
          delta: `${availablePct}%`,
          icon: BedDouble,
          accent: 'var(--nestora-sage)',
          surface: 'color-mix(in oklch, var(--nestora-sage-light) 22%, var(--card))',
          barPct: availablePct,
          barColor: BAR_GREEN,
        },
        {
          key: 'maintenance',
          label: 'Maintenance',
          value: ROOM_DIRECTORY_STATS.maintenanceRooms,
          hint: 'Temporarily unavailable',
          delta: `${maintenancePct}%`,
          icon: Hammer,
          accent: BAR_GOLD,
          surface: 'color-mix(in oklch, var(--nestora-gold) 16%, var(--card))',
          barPct: maintenancePct,
          barColor: BAR_GOLD,
        },
      ] as const,
      bedStats: [
        { label: 'Total beds', value: ROOM_DIRECTORY_STATS.totalBeds, pct: 100 },
        { label: 'Occupied beds', value: ROOM_DIRECTORY_STATS.occupiedBeds, pct: bedOccPct },
        { label: 'Available beds', value: ROOM_DIRECTORY_STATS.availableBeds, pct: bedAvailPct },
      ] as const,
    };
  }, []);

  useGSAP(
    () => {
      if (reduceMotion || !sectionRef.current) {
        return;
      }
      gsap.from(sectionRef.current.querySelectorAll('[data-rooms-stat-card]'), {
        opacity: 0,
        y: 16,
        duration: 0.42,
        stagger: { each: 0.07, from: 'start', grid: 'auto' },
        ease: 'back.out(1.1)',
        clearProps: 'opacity,transform',
      });
      gsap.from(sectionRef.current.querySelectorAll('[data-rooms-stat-bar]'), {
        scaleX: 0,
        duration: 0.65,
        stagger: 0.07,
        delay: 0.12,
        ease: 'power3.out',
        transformOrigin: 'left center',
        clearProps: 'transform',
      });
      gsap.from(sectionRef.current.querySelectorAll('[data-rooms-bed-metric]'), {
        opacity: 0,
        x: -8,
        duration: 0.35,
        stagger: 0.06,
        delay: 0.2,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: sectionRef, dependencies: [reduceMotion] },
  );

  return (
    <section ref={sectionRef} aria-labelledby="rooms-summary-heading" className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--nestora-sage)]">Inventory</p>
          <h2 id="rooms-summary-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
            Room &amp; bed snapshot
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">
          {ROOM_DIRECTORY_STATS.totalRooms.toLocaleString('en-IN')} rooms ·{' '}
          {ROOM_DIRECTORY_STATS.totalBeds.toLocaleString('en-IN')} beds
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {roomStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <li key={stat.key} data-rooms-stat-card>
              <motion.article
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05, ease: motionEase }}
                whileHover={reduceMotion ? undefined : { y: -3 }}
                className={cn(
                  'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] p-4 shadow-sm',
                  'transition-[border-color,box-shadow] duration-200 hover:border-[color-mix(in_oklch,var(--nestora-sage)_36%,var(--border))] hover:shadow-md',
                )}
                style={{ background: stat.surface }}
              >
                <motion.span
                  className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full opacity-30 blur-2xl transition-opacity duration-300 group-hover:opacity-45"
                  style={{ background: stat.accent }}
                  aria-hidden
                />
                <div className="relative mb-3 flex items-start justify-between gap-2">
                  <span className="flex size-10 items-center justify-center rounded-xl border border-[var(--nestora-sage-muted)] bg-card/90 text-[var(--nestora-forest)] shadow-sm transition-transform duration-200 group-hover:scale-[1.03]">
                    <Icon className="size-4" style={{ color: stat.accent }} aria-hidden />
                  </span>
                  <span className="inline-flex items-center gap-0.5 rounded-full border border-border/80 bg-card/85 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {stat.key === 'occupied' ? <TrendingUp className="size-3 text-[#6d9773]" aria-hidden /> : null}
                    {stat.delta}
                  </span>
                </div>
                <p className="relative text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                  {stat.value.toLocaleString('en-IN')}
                </p>
                <p className="relative mt-0.5 text-sm font-medium text-foreground">{stat.label}</p>
                <p className="relative mt-1 text-xs text-muted-foreground">{stat.hint}</p>
                <div className="relative mt-3 h-1 overflow-hidden rounded-full bg-[#e7e7dc]">
                  <div
                    data-rooms-stat-bar
                    className="h-full origin-left rounded-full"
                    style={{ width: `${stat.barPct}%`, backgroundColor: stat.barColor }}
                    role="presentation"
                  />
                </div>
              </motion.article>
            </li>
          );
        })}
      </ul>

      <div
        className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-cream)_18%,var(--card))] p-4"
        aria-label="Bed-level occupancy"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--nestora-sage)]">Bed occupancy</p>
        <ul className="mt-3 grid gap-3 sm:grid-cols-3">
          {bedStats.map((bed) => (
            <li key={bed.label} data-rooms-bed-metric className="space-y-2">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs font-medium text-muted-foreground">{bed.label}</span>
                <span className="text-lg font-semibold tabular-nums text-[var(--nestora-forest)]">
                  {bed.value.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#e7e7dc]">
                <div
                  data-rooms-stat-bar
                  className="h-full origin-left rounded-full bg-[#6d9773]"
                  style={{ width: `${bed.pct}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
