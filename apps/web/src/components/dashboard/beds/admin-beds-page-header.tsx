'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { BedDouble, Download, FileSpreadsheet, Plus } from 'lucide-react';
import { useMemo, useRef } from 'react';

import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import type { BedDirectorySummary } from '@/lib/api/beds';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

const BAR_GREEN = '#6d9773';
const BAR_GOLD = '#ffba00';
const BAR_TRACK = '#e7e7dc';

type AdminBedsPageHeaderProps = {
  onAddBed: () => void;
  summary: BedDirectorySummary | null;
  loading?: boolean;
};

export function AdminBedsPageHeader({ onAddBed, summary, loading = false }: AdminBedsPageHeaderProps) {
  const reduceMotion = useReducedMotion();
  const headerRef = useRef<HTMLElement>(null);

  const { totalBeds, occupancyPct, occupiedW, reservedW, maintenanceW, availableW } = useMemo(() => {
    const t = summary?.totalBeds ?? 0;
    const occupied = summary?.occupied ?? 0;
    const available = summary?.available ?? 0;
    const reserved = summary?.reserved ?? 0;
    const maintenance = summary?.maintenance ?? 0;
    return {
      totalBeds: t,
      occupancyPct: summary?.occupiedRatePercent ?? (t > 0 ? Math.round((occupied / t) * 1000) / 10 : 0),
      occupiedW: t > 0 ? (occupied / t) * 100 : 0,
      reservedW: t > 0 ? (reserved / t) * 100 : 0,
      maintenanceW: t > 0 ? (maintenance / t) * 100 : 0,
      availableW: t > 0 ? (available / t) * 100 : 0,
    };
  }, [summary]);

  useGSAP(
    () => {
      if (reduceMotion || !headerRef.current) return;
      gsap.from(headerRef.current.querySelectorAll('[data-beds-hero]'), {
        opacity: 0,
        y: 12,
        duration: 0.45,
        stagger: 0.07,
        ease: 'back.out(1.15)',
        clearProps: 'opacity,transform',
      });
      gsap.from(headerRef.current.querySelectorAll('[data-beds-hero-bar]'), {
        scaleX: 0,
        duration: 0.75,
        stagger: 0.06,
        delay: 0.12,
        ease: 'power3.out',
        transformOrigin: 'left center',
        clearProps: 'transform',
      });
    },
    { scope: headerRef, dependencies: [reduceMotion] },
  );

  return (
    <header
      ref={headerRef}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))]',
        'bg-card shadow-[0_1px_0_0_color-mix(in_oklch,var(--nestora-sage-muted)_45%,transparent),0_16px_40px_-32px_color-mix(in_srgb,var(--nestora-forest)_28%,transparent)]',
      )}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 flex w-1 flex-col overflow-hidden rounded-l-2xl" aria-hidden>
        <span className="min-h-0 flex-[7] bg-[#6d9773]" />
        <span className="min-h-0 flex-[2] bg-[#ffba00]" />
        <span className="min-h-0 flex-[1] bg-[color-mix(in_oklch,var(--muted-foreground)_40%,var(--border))]" />
      </div>

      <div className="relative flex flex-col gap-4 p-4 pl-5 sm:flex-row sm:items-center sm:justify-between sm:p-5 sm:pl-6">
        <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
          <motion.span
            data-beds-hero
            className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[var(--nestora-sage-muted)] bg-[color-mix(in_oklch,var(--nestora-sage-light)_55%,var(--card))] text-[var(--nestora-forest)] shadow-sm"
            whileHover={reduceMotion ? undefined : { scale: 1.04, rotate: -2 }}
            transition={{ type: 'spring', stiffness: 520, damping: 26 }}
          >
            <BedDouble className="size-5" aria-hidden />
          </motion.span>
          <div className="min-w-0" data-beds-hero>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--nestora-sage)]">Room Management</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--nestora-forest)] sm:text-[1.65rem]">
              Bed Inventory
            </h1>
            <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
              Track bed availability, occupancy, reservations, and maintenance across hostels ·{' '}
              <span className="font-semibold tabular-nums text-foreground">
                {loading ? '—' : totalBeds.toLocaleString('en-IN')}
              </span>{' '}
              beds ·{' '}
              <span className="font-medium text-[var(--nestora-forest)]">{loading ? '—' : `${occupancyPct}%`}</span>{' '}
              occupied
            </p>
          </div>
        </div>

        <div data-beds-hero className="flex w-full shrink-0 flex-wrap gap-2 sm:w-auto sm:justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                'inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[var(--nestora-sage-muted)] bg-[color-mix(in_oklch,var(--nestora-cream)_25%,var(--card))] px-3 text-sm font-semibold text-[var(--nestora-forest)]',
                'transition-colors hover:bg-[color-mix(in_oklch,var(--nestora-sage-light)_45%,var(--card))]',
                focusRing,
              )}
            >
              <Download className="size-4" aria-hidden />
              Export
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem>
                <Download className="size-4" aria-hidden />
                Download CSV
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileSpreadsheet className="size-4" aria-hidden />
                Download Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <motion.div whileTap={reduceMotion ? undefined : { scale: 0.97 }}>
            <Button
              type="button"
              onClick={onAddBed}
              className={cn(
                'h-9 rounded-xl bg-[var(--nestora-forest)] px-4 text-sm font-semibold text-white shadow-sm hover:brightness-110',
                focusRing,
              )}
            >
              <Plus className="size-4" aria-hidden />
              Add Bed
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="relative border-t border-[var(--nestora-sage-muted)]/60 px-5 py-2.5 pl-6 sm:pl-7">
        <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Inventory mix</div>
        <div className="flex h-2 overflow-hidden rounded-full" style={{ backgroundColor: BAR_TRACK }}>
          <div data-beds-hero-bar className="h-full shrink-0" style={{ width: `${occupiedW}%`, backgroundColor: BAR_GREEN }} />
          <div data-beds-hero-bar className="h-full shrink-0" style={{ width: `${reservedW}%`, backgroundColor: BAR_GOLD }} />
          <div
            data-beds-hero-bar
            className="h-full shrink-0 bg-[color-mix(in_oklch,var(--muted-foreground)_45%,var(--border))]"
            style={{ width: `${maintenanceW}%` }}
          />
          <div
            data-beds-hero-bar
            className="h-full shrink-0 bg-[color-mix(in_oklch,var(--nestora-sage-light)_65%,var(--card))]"
            style={{ width: `${availableW}%` }}
          />
        </div>
      </div>
    </header>
  );
}
