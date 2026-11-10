'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Download, LayoutTemplate, Plus } from 'lucide-react';
import { useRef } from 'react';

import { ROOM_TYPE_STATS } from '@/components/dashboard/room-types/admin-room-types-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = { onAdd: () => void };

export function AdminRoomTypesPageHeader({ onAdd }: Props) {
  const reduceMotion = useReducedMotion();
  const headerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reduceMotion || !headerRef.current) return;
      gsap.from(headerRef.current.querySelectorAll('[data-rt-hero]'), {
        opacity: 0,
        y: 12,
        stagger: 0.07,
        duration: 0.45,
        ease: 'back.out(1.12)',
        clearProps: 'opacity,transform',
      });
    },
    { scope: headerRef, dependencies: [reduceMotion] },
  );

  return (
    <header
      ref={headerRef}
      className="relative overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] bg-card p-5 pl-6 shadow-sm"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3" data-rt-hero>
          <motion.span
            className="flex size-11 items-center justify-center rounded-xl border border-[var(--nestora-sage-muted)] bg-[color-mix(in_oklch,var(--nestora-sage-light)_50%,var(--card))]"
            whileHover={reduceMotion ? undefined : { scale: 1.04 }}
          >
            <LayoutTemplate className="size-5 text-[var(--nestora-forest)]" aria-hidden />
          </motion.span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--nestora-sage)]">Room Management</p>
            <h1 className="text-2xl font-semibold text-[var(--nestora-forest)]">Room Types</h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Manage categories, capacity, facilities, pricing, and configurations ·{' '}
              <span className="font-semibold tabular-nums text-foreground">{ROOM_TYPE_STATS.activeTypes}</span> active types
            </p>
          </div>
        </div>
        <div data-rt-hero className="flex gap-2">
          <Button type="button" variant="outline" className="h-9 rounded-xl border-[var(--nestora-sage-muted)]">
            <Download className="size-4" aria-hidden />
            Export
          </Button>
          <Button type="button" onClick={onAdd} className={cn('h-9 rounded-xl bg-[var(--nestora-forest)] text-white', focusRing)}>
            <Plus className="size-4" aria-hidden />
            Add Room Type
          </Button>
        </div>
      </div>
    </header>
  );
}
