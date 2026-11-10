'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Download, FileSpreadsheet, MapPinned, Plus } from 'lucide-react';
import { useMemo, useRef } from 'react';

import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import type { HostelDirectorySummary } from '@/lib/api/hostels';
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

type AdminHostelsPageHeaderProps = {
  onAdd: () => void;
  summary: HostelDirectorySummary | null;
  loading?: boolean;
};

export function AdminHostelsPageHeader({ onAdd, summary, loading = false }: AdminHostelsPageHeaderProps) {
  const reduceMotion = useReducedMotion();
  const headerRef = useRef<HTMLElement>(null);

  const { boysShare, girlsShare, activeShare, totalBeds, avgOcc, activeCount, totalHostels } = useMemo(() => {
    const total = summary?.totalHostels ?? 0;
    const active = summary?.activeHostels ?? 0;
    return {
      totalHostels: total,
      activeCount: active,
      activeShare: total > 0 ? (active / total) * 100 : 0,
      boysShare: summary?.boysBedsSharePct ?? 0,
      girlsShare: summary?.girlsBedsSharePct ?? 0,
      totalBeds: summary?.totalBedCapacity ?? 0,
      avgOcc: summary?.averageOccupancyPct ?? 0,
    };
  }, [summary]);

  useGSAP(
    () => {
      if (reduceMotion || !headerRef.current) return;
      gsap.from(headerRef.current.querySelectorAll('[data-hostel-hero]'), {
        opacity: 0,
        y: 12,
        duration: 0.45,
        stagger: 0.07,
        ease: 'back.out(1.15)',
        clearProps: 'opacity,transform',
      });
      gsap.from(headerRef.current.querySelectorAll('[data-hostel-hero-bar]'), {
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
        <span className="min-h-0 flex-[5] bg-[#6d9773]" />
        <span className="min-h-0 flex-[2] bg-[#ffba00]" />
        <span className="min-h-0 flex-[3] bg-[var(--nestora-forest)]" />
      </div>
      <div
        className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--nestora-sage)_20%,transparent),transparent_68%)]"
        aria-hidden
      />
      <div className="relative grid gap-6 p-5 pl-6 sm:p-6 sm:pl-7 lg:grid-cols-[1fr,minmax(0,16rem)]">
        <div className="space-y-4">
          <div data-hostel-hero className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <MapPinned className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
            Dashboard / Hostel Management
          </div>
          <div data-hostel-hero>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--nestora-forest)] sm:text-[1.65rem]">
              Hostel Management
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Manage university hostels, gender categories, buildings, blocks, and campus-wide bed capacity. Inactive hostels
              retain historical room data; new rooms require an active facility.
            </p>
          </div>
          <div data-hostel-hero className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={onAdd}
              className={cn('rounded-xl bg-[var(--nestora-forest)] text-white hover:bg-[color-mix(in_oklch,var(--nestora-forest)_88%,black)]', focusRing)}
            >
              <Plus className="size-4" aria-hidden />
              Add Hostel
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button type="button" variant="outline" className={cn('rounded-xl', focusRing)} />
                }
              >
                <Download className="size-4" aria-hidden />
                Export
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="rounded-xl">
                <DropdownMenuItem>
                  <FileSpreadsheet className="size-4" aria-hidden />
                  Spreadsheet (sample)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <motion.aside
          data-hostel-hero
          initial={reduceMotion ? false : { opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--card))] p-4"
          aria-label="Campus distribution preview"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--nestora-sage)]">Campus snapshot</p>
          <div className="mt-3 space-y-3 text-xs">
            <div>
              <motion.div
                className="mb-1 flex justify-between text-muted-foreground"
                data-hostel-hero
                style={{ opacity: 1 }}
              >
                <span>Active share</span>
                <span className="font-semibold tabular-nums text-foreground">
                  {loading ? '—' : activeCount} hostels
                </span>
              </motion.div>
              <div className="h-2 overflow-hidden rounded-full bg-[#e7e7dc]">
                <motion.div
                  data-hostel-hero-bar
                  className="h-full rounded-full bg-[#6d9773]"
                  style={{ width: loading ? '0%' : `${activeShare}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-muted-foreground">
                <span>Boys capacity</span>
                <span className="tabular-nums">{loading ? '—' : `${boysShare}%`}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#e7e7dc]">
                <div
                  data-hostel-hero-bar
                  className="h-full rounded-full bg-[var(--nestora-forest)]"
                  style={{ width: loading ? '0%' : `${boysShare}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-muted-foreground">
                <span>Girls capacity</span>
                <span className="tabular-nums">{loading ? '—' : `${girlsShare}%`}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#e7e7dc]">
                <div
                  data-hostel-hero-bar
                  className="h-full rounded-full bg-[#ffba00]"
                  style={{ width: loading ? '0%' : `${girlsShare}%` }}
                />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {loading ? '—' : totalBeds.toLocaleString('en-IN')} total beds ·{' '}
              {loading ? '—' : `${avgOcc}%`} avg occupancy · {loading ? '—' : totalHostels} hostels
            </p>
          </div>
        </motion.aside>
      </div>
    </header>
  );
}
