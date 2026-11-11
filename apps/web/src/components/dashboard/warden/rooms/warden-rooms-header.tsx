'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { BedDouble, Building2, UserPlus } from 'lucide-react';
import { useRef } from 'react';

import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  hostelName: string;
  availableBeds: number;
  occupiedBeds: number;
  onAssignBed: () => void;
};

export function WardenRoomsHeader({ hostelName, availableBeds, occupiedBeds, onAssignBed }: Props) {
  const reduceMotion = useReducedMotion();
  const headerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reduceMotion || !headerRef.current) return;
      gsap.from(headerRef.current.querySelectorAll('[data-warden-rooms-hero]'), {
        opacity: 0,
        y: 14,
        duration: 0.42,
        stagger: 0.08,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: headerRef, dependencies: [reduceMotion] },
  );

  return (
    <header
      ref={headerRef}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))]',
        'bg-[linear-gradient(135deg,color-mix(in_oklch,var(--nestora-cream)_50%,var(--card))_0%,var(--card)_60%)] shadow-sm',
      )}
    >
      <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-end sm:justify-between">
        <div data-warden-rooms-hero className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--nestora-sage)]">
            Room &amp; Bed Management
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--nestora-forest)]">
            Bed matrix &amp; vacancy
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Assign individual beds, review vacancy, and process room-change requests for your hostel (FR-026–FR-030).
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="gap-1.5 border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] bg-card font-semibold text-[var(--nestora-forest)]"
            >
              <Building2 className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
              {hostelName}
            </Badge>
            <span className="text-xs text-muted-foreground">Independent per-bed allocation (FR-027)</span>
          </div>
        </div>

        <motion.div
          data-warden-rooms-hero
          className="flex flex-wrap items-center gap-2"
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35, ease: motionEase }}
        >
          <div className="flex items-center gap-3 rounded-xl border border-border/80 bg-card/90 px-3 py-2 shadow-sm">
            <BedDouble className="size-4 text-[var(--nestora-sage)]" aria-hidden />
            <div>
              <p className="text-lg font-semibold tabular-nums leading-none">{availableBeds}</p>
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Available</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-[color-mix(in_oklch,var(--nestora-forest)_20%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-forest)_6%,var(--card))] px-3 py-2 shadow-sm">
            <BedDouble className="size-4 text-[var(--nestora-forest)]" aria-hidden />
            <div>
              <p className="text-lg font-semibold tabular-nums leading-none">{occupiedBeds}</p>
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Occupied</p>
            </div>
          </div>
          <Button type="button" className={cn('rounded-xl bg-[var(--nestora-forest)]', focusRing)} onClick={onAssignBed}>
            <UserPlus className="size-4" aria-hidden />
            Assign bed
          </Button>
        </motion.div>
      </div>
    </header>
  );
}
