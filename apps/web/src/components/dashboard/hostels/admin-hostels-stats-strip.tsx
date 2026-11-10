'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Building2, Construction, Power, PowerOff, Users } from 'lucide-react';
import { useMemo, useRef } from 'react';

import { GENDER_OVERVIEW, HOSTEL_STATS } from '@/components/dashboard/hostels/admin-hostels-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

export function AdminHostelsStatsStrip() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const cards = useMemo(
    () => [
      {
        key: 'total',
        label: 'Total Hostels',
        value: HOSTEL_STATS.totalHostels,
        hint: 'Registered facilities',
        icon: Building2,
        accent: 'var(--nestora-forest)',
      },
      {
        key: 'active',
        label: 'Active',
        value: HOSTEL_STATS.activeHostels,
        hint: 'Open for allocation',
        icon: Power,
        accent: '#6d9773',
      },
      {
        key: 'setup',
        label: 'Under Setup',
        value: HOSTEL_STATS.underSetup,
        hint: 'Not yet assignable',
        icon: Construction,
        accent: 'var(--nestora-gold)',
      },
      {
        key: 'inactive',
        label: 'Inactive',
        value: HOSTEL_STATS.inactiveHostels,
        hint: 'Historical only',
        icon: PowerOff,
        accent: 'var(--muted-foreground)',
      },
      {
        key: 'capacity',
        label: 'Total Bed Capacity',
        value: HOSTEL_STATS.totalBedCapacity,
        hint: `Avg occupancy ${HOSTEL_STATS.averageOccupancyPct}%`,
        icon: Users,
        accent: 'var(--nestora-sage)',
      },
    ],
    [],
  );

  useGSAP(
    () => {
      if (reduceMotion || !sectionRef.current) return;
      gsap.from(sectionRef.current.querySelectorAll('[data-hostel-stat]'), {
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
    <section ref={sectionRef} aria-labelledby="hostel-stats-heading" className="space-y-3">
      <h2 id="hostel-stats-heading" className="sr-only">
        Hostel statistics
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <li key={card.key} data-hostel-stat>
              <motion.article
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.35, ease: motionEase }}
                whileHover={reduceMotion ? undefined : { y: -3 }}
                className={cn(
                  'rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] p-4 shadow-sm',
                  'bg-[color-mix(in_oklch,var(--card)_92%,white)]',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{card.label}</p>
                  <span
                    className="flex size-8 items-center justify-center rounded-lg border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))]"
                    style={{ color: card.accent }}
                  >
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
      <div
        data-hostel-stat
        className="flex flex-wrap items-center gap-2 rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card px-4 py-3"
        aria-label="Hostels by gender category"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--nestora-sage)]">By category</p>
        {GENDER_OVERVIEW.map((row) => (
          <span
            key={row.label}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--nestora-sage-muted)]/70 bg-[color-mix(in_oklch,var(--nestora-cream)_18%,var(--card))] px-3 py-1 text-xs"
          >
            <span className="font-medium text-foreground">{row.label}</span>
            <span className="tabular-nums text-muted-foreground">
              {row.count} · {row.beds} beds
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}
