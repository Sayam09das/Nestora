'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Download, FileSpreadsheet, LayoutGrid, Plus } from 'lucide-react';
import { useMemo, useRef } from 'react';

import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import type { RoomDirectorySummary } from '@/lib/api/rooms';
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

type AdminRoomsPageHeaderProps = {
  summary: RoomDirectorySummary | null;
  loading?: boolean;
};

export function AdminRoomsPageHeader({ summary, loading = false }: AdminRoomsPageHeaderProps) {
  const reduceMotion = useReducedMotion();
  const headerRef = useRef<HTMLElement>(null);

  const {
    totalRooms,
    availableRooms,
    maintenanceRooms,
    occupiedRoomPct,
    availableRoomPct,
    maintenanceRoomPct,
    bedFillPct,
  } = useMemo(() => {
    const total = summary?.totalRooms ?? 0;
    const occupied = summary?.occupiedRooms ?? 0;
    const available = summary?.availableRooms ?? 0;
    const maintenance = summary?.maintenanceRooms ?? 0;
    const bedTotal = summary?.totalBeds ?? 0;
    const bedOcc = summary?.occupiedBeds ?? 0;
    return {
      totalRooms: total,
      availableRooms: available,
      maintenanceRooms: maintenance,
      occupiedRoomPct: total > 0 ? (occupied / total) * 100 : 0,
      availableRoomPct: total > 0 ? (available / total) * 100 : 0,
      maintenanceRoomPct: total > 0 ? (maintenance / total) * 100 : 0,
      bedFillPct: bedTotal > 0 ? Math.round((bedOcc / bedTotal) * 1000) / 10 : 0,
    };
  }, [summary]);

  useGSAP(
    () => {
      if (reduceMotion || !headerRef.current) {
        return;
      }
      gsap.from(headerRef.current.querySelectorAll('[data-rooms-hero]'), {
        opacity: 0,
        y: 12,
        duration: 0.45,
        stagger: 0.07,
        ease: 'back.out(1.15)',
        clearProps: 'opacity,transform',
      });
      gsap.from(headerRef.current.querySelectorAll('[data-rooms-hero-bar]'), {
        scaleX: 0,
        duration: 0.75,
        stagger: 0.08,
        ease: 'power3.out',
        delay: 0.15,
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
        <span className="min-h-0 flex-[6] bg-[#6d9773]" />
        <span className="min-h-0 flex-[2] bg-[#ffba00]" />
        <span className="min-h-0 flex-[2] bg-[color-mix(in_oklch,var(--muted-foreground)_40%,var(--border))]" />
      </div>
      <div
        className="pointer-events-none absolute -right-12 -top-16 size-48 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--nestora-sage)_22%,transparent),transparent_70%)]"
        aria-hidden
      />

      <div className="relative flex flex-col gap-4 p-4 pl-5 sm:flex-row sm:items-center sm:justify-between sm:p-5 sm:pl-6">
        <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
          <motion.span
            data-rooms-hero
            className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[var(--nestora-sage-muted)] bg-[color-mix(in_oklch,var(--nestora-sage-light)_55%,var(--card))] text-[var(--nestora-forest)] shadow-sm"
            whileHover={reduceMotion ? undefined : { scale: 1.04, rotate: -2 }}
            transition={{ type: 'spring', stiffness: 520, damping: 26 }}
          >
            <LayoutGrid className="size-5" aria-hidden />
          </motion.span>

          <div className="min-w-0" data-rooms-hero>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--nestora-sage)]">Room Management</p>
              <span className="inline-flex items-center rounded-full border border-[color-mix(in_oklch,var(--nestora-sage)_30%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage-light)_40%,var(--card))] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--nestora-forest)]">
                All Rooms
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--nestora-forest)] sm:text-[1.65rem]">
              All Rooms
            </h1>
            <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
              Manage hostel rooms, occupancy, availability, and room assignments across{' '}
              <span className="font-semibold tabular-nums text-foreground">
                {loading ? '—' : totalRooms.toLocaleString('en-IN')}
              </span>{' '}
              rooms ·{' '}
              <span className="font-medium text-[var(--nestora-forest)]">{loading ? '—' : `${bedFillPct}%`}</span> bed
              utilization
            </p>
            <ul className="mt-3 flex flex-wrap gap-2" aria-label="Quick counts">
              <li
                data-rooms-hero
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--nestora-sage-muted)] bg-[color-mix(in_oklch,var(--nestora-sage-light)_35%,var(--card))] px-2.5 py-1 text-[11px] font-semibold text-[var(--nestora-forest)]"
              >
                <span className="size-1.5 rounded-full bg-[var(--nestora-sage)]" aria-hidden />
                {loading ? '—' : availableRooms} with open beds
              </li>
              <li
                data-rooms-hero
                className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_oklch,var(--nestora-gold)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_12%,var(--card))] px-2.5 py-1 text-[11px] font-semibold text-[var(--nestora-forest)]"
              >
                <span className="size-1.5 rounded-full bg-[var(--nestora-gold)]" aria-hidden />
                {loading ? '—' : maintenanceRooms} in maintenance
              </li>
            </ul>
          </div>
        </div>

        <div data-rooms-hero className="flex w-full shrink-0 flex-wrap gap-2 sm:w-auto sm:justify-end">
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

          <motion.div whileTap={reduceMotion ? undefined : { scale: 0.97 }} transition={{ type: 'spring', stiffness: 520, damping: 28 }}>
            <Button
              type="button"
              className="h-9 rounded-xl bg-[var(--nestora-forest)] px-4 text-sm font-semibold text-white shadow-sm hover:brightness-110"
            >
              <Plus className="size-4" aria-hidden />
              Add Room
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="relative border-t border-[var(--nestora-sage-muted)]/60 px-5 py-2.5 pl-6 sm:pl-7">
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          <span>Operational mix</span>
          <span className="flex flex-wrap items-center gap-3 normal-case tracking-normal">
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full" style={{ backgroundColor: BAR_GREEN }} aria-hidden />
              Full / occupied
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-[var(--nestora-sage)]" aria-hidden />
              Available
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full" style={{ backgroundColor: BAR_GOLD }} aria-hidden />
              Maintenance
            </span>
          </span>
        </div>
        <div className="flex h-2 overflow-hidden rounded-full" style={{ backgroundColor: BAR_TRACK }} role="img" aria-label="Room operational status distribution">
          <div data-rooms-hero-bar className="h-full shrink-0" style={{ width: `${occupiedRoomPct}%`, backgroundColor: BAR_GREEN }} />
          <div data-rooms-hero-bar className="h-full shrink-0" style={{ width: `${availableRoomPct}%`, backgroundColor: 'var(--nestora-sage)' }} />
          <div data-rooms-hero-bar className="h-full shrink-0" style={{ width: `${maintenanceRoomPct}%`, backgroundColor: BAR_GOLD }} />
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Operational status is separate from bed-level vacancy — maintenance rooms may still show empty beds.
        </p>
      </div>
    </header>
  );
}
