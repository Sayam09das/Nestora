'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { BedDouble, Building, Hammer, LayoutGrid } from 'lucide-react';
import { useMemo, useRef } from 'react';

import type { WardenHostelInventoryStats } from '@/hooks/use-warden-hostel-inventory-stats';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

type Props = {
  hostelName: string;
  stats: WardenHostelInventoryStats | null;
  loading?: boolean;
};

export function WardenRoomsStatsStrip({ hostelName, stats, loading = false }: Props) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const cards = useMemo(() => {
    const bedsTotal = (stats?.availableBeds ?? 0) + (stats?.occupiedBeds ?? 0);
    const occPct = bedsTotal > 0 ? Math.round(((stats?.occupiedBeds ?? 0) / bedsTotal) * 1000) / 10 : 0;
    return [
      {
        key: 'rooms',
        label: 'Rooms tracked',
        value: stats == null && loading ? null : (stats?.totalRooms ?? 0),
        hint: hostelName,
        icon: LayoutGrid,
        barPct: 100,
        barColor: 'var(--nestora-sage)',
      },
      {
        key: 'available',
        label: 'Open beds',
        value: stats == null && loading ? null : (stats?.availableBeds ?? 0),
        hint: 'Ready for allocation',
        icon: BedDouble,
        barPct: bedsTotal > 0 ? Math.round(((stats?.availableBeds ?? 0) / bedsTotal) * 1000) / 10 : 0,
        barColor: '#6d9773',
      },
      {
        key: 'occupied',
        label: 'Occupied beds',
        value: stats == null && loading ? null : (stats?.occupiedBeds ?? 0),
        hint: `${occPct}% occupancy`,
        icon: Building,
        barPct: occPct,
        barColor: 'var(--nestora-forest)',
      },
      {
        key: 'maint',
        label: 'Rooms in maintenance',
        value: stats == null && loading ? null : (stats?.maintenanceRooms ?? 0),
        hint: 'Blocked from assignment',
        icon: Hammer,
        barPct: stats?.totalRooms ? Math.min(100, ((stats.maintenanceRooms ?? 0) / stats.totalRooms) * 100) : 0,
        barColor: 'var(--nestora-gold)',
      },
    ] as const;
  }, [stats, loading, hostelName]);

  useGSAP(
    () => {
      if (reduceMotion || !sectionRef.current) return;
      gsap.from(sectionRef.current.querySelectorAll('[data-warden-inv-stat]'), {
        opacity: 0,
        y: 14,
        duration: 0.4,
        stagger: 0.07,
        ease: 'back.out(1.1)',
        clearProps: 'opacity,transform',
      });
    },
    { scope: sectionRef, dependencies: [reduceMotion, stats?.totalRooms] },
  );

  return (
    <section ref={sectionRef} aria-labelledby="warden-inventory-stats" className="space-y-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--nestora-sage)]">Inventory</p>
        <h2 id="warden-inventory-stats" className="text-base font-semibold text-[var(--nestora-forest)]">
          Live bed capacity
        </h2>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <li key={card.key} data-warden-inv-stat>
              <motion.article
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: index * 0.04, ease: motionEase }}
                className="flex h-full flex-col rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card p-4 shadow-sm"
              >
                <Icon className="mb-3 size-4 text-[var(--nestora-sage)]" aria-hidden />
                <p className="text-2xl font-semibold tabular-nums">{card.value == null ? '—' : card.value}</p>
                <p className="mt-0.5 text-sm font-medium">{card.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#e7e7dc]">
                  <div className="h-full rounded-full" style={{ width: `${card.barPct}%`, backgroundColor: card.barColor }} />
                </div>
              </motion.article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
