'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { BedDouble, Layers, LayoutGrid, Power, PowerOff } from 'lucide-react';
import { useMemo, useRef } from 'react';

import { CATEGORY_OVERVIEW, ROOM_TYPE_STATS } from '@/components/dashboard/room-types/admin-room-types-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

export function AdminRoomTypesStatsStrip() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const cards = useMemo(
    () => [
      {
        key: 'total',
        label: 'Total Room Types',
        value: ROOM_TYPE_STATS.totalTypes,
        hint: 'Registered categories',
        icon: LayoutGrid,
        accent: 'var(--nestora-forest)',
        surface: 'color-mix(in oklch, var(--nestora-forest) 7%, var(--card))',
      },
      {
        key: 'active',
        label: 'Active Types',
        value: ROOM_TYPE_STATS.activeTypes,
        hint: 'Available for new rooms',
        icon: Power,
        accent: '#6d9773',
        surface: 'color-mix(in oklch, var(--nestora-sage) 14%, var(--card))',
      },
      {
        key: 'inactive',
        label: 'Inactive Types',
        value: ROOM_TYPE_STATS.inactiveTypes,
        hint: 'Historical config only',
        icon: PowerOff,
        accent: 'var(--muted-foreground)',
        surface: 'color-mix(in oklch, var(--nestora-cream) 22%, var(--card))',
      },
      {
        key: 'capacity',
        label: 'Total Room Capacity',
        value: ROOM_TYPE_STATS.totalRoomCapacity,
        hint: 'Combined student capacity',
        icon: BedDouble,
        accent: 'var(--nestora-sage)',
        surface: 'color-mix(in oklch, var(--nestora-sage-light) 22%, var(--card))',
      },
      {
        key: 'avg',
        label: 'Avg Room Capacity',
        value: ROOM_TYPE_STATS.averageRoomCapacity,
        hint: 'Beds per room (avg)',
        icon: Layers,
        accent: 'var(--nestora-gold)',
        surface: 'color-mix(in oklch, var(--nestora-gold) 12%, var(--card))',
      },
    ],
    [],
  );

  useGSAP(
    () => {
      if (reduceMotion || !sectionRef.current) return;
      gsap.from(sectionRef.current.querySelectorAll('[data-rt-stat]'), {
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
    <section ref={sectionRef} aria-labelledby="rt-stats-heading" className="space-y-3">
      <h2 id="rt-stats-heading" className="sr-only">
        Room type statistics
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <li key={card.key} data-rt-stat>
              <motion.article
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.35, ease: motionEase }}
                whileHover={reduceMotion ? undefined : { y: -3 }}
                className={cn(
                  'rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] p-4 shadow-sm',
                )}
                style={{ background: card.surface }}
              >
                <Icon className="size-4" style={{ color: card.accent }} aria-hidden />
                <p className="mt-3 text-2xl font-semibold tabular-nums">{card.value.toLocaleString('en-IN')}</p>
                <p className="text-sm font-medium">{card.label}</p>
                <p className="text-xs text-muted-foreground">{card.hint}</p>
              </motion.article>
            </li>
          );
        })}
      </ul>

      <div className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card p-4">
        <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--nestora-sage)]">Types by category</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {CATEGORY_OVERVIEW.map((row) => (
            <li
              key={row.category}
              data-rt-stat
              className="inline-flex items-center gap-2 rounded-full border border-[var(--nestora-sage-muted)] bg-[color-mix(in_oklch,var(--nestora-cream)_15%,var(--card))] px-3 py-1 text-xs font-semibold text-[var(--nestora-forest)]"
            >
              {row.category}
              <span className="tabular-nums text-muted-foreground">{row.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
