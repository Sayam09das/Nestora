'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Building2,
  ChevronDown,
  DoorOpen,
  Layers,
  LayoutTemplate,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  CircleDot,
  X,
} from 'lucide-react';
import { useMemo, useRef, type ReactNode } from 'react';

import {
  BED_BLOCK_FILTER_OPTIONS,
  BED_FLOOR_FILTER_OPTIONS,
  BED_HOSTEL_FILTER_OPTIONS,
  BED_ROOM_FILTER_OPTIONS,
  BED_STATUS_FILTER_OPTIONS,
} from '@/components/dashboard/beds/admin-beds-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;
const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type AdminBedsFiltersBarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  hostelFilter: string;
  onHostelFilterChange: (value: string) => void;
  blockFilter: string;
  onBlockFilterChange: (value: string) => void;
  floorFilter: string;
  onFloorFilterChange: (value: string) => void;
  roomFilter: string;
  onRoomFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onReset: () => void;
  filteredCount: number;
  hostelOptions?: readonly string[];
  blockOptions?: readonly string[];
  floorOptions?: readonly string[];
  roomOptions?: readonly string[];
};

function FilterField({
  label,
  icon,
  value,
  options,
  onChange,
  active,
}: {
  label: string;
  icon: ReactNode;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  active: boolean;
}) {
  return (
    <label data-beds-filter-field className="flex min-w-0 flex-col gap-1.5">
      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        <span className="flex size-5 items-center justify-center rounded-md border border-[var(--nestora-sage-muted)]/80 bg-card/90 text-[var(--nestora-forest)]">
          {icon}
        </span>
        {label}
      </span>
      <span className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'h-10 w-full appearance-none rounded-xl border bg-card/95 pr-9 pl-3 text-sm text-foreground shadow-sm',
            active
              ? 'border-[color-mix(in_oklch,var(--nestora-sage)_42%,var(--border))] shadow-[0_0_0_3px_color-mix(in_srgb,var(--nestora-sage)_12%,transparent)]'
              : 'border-[var(--nestora-sage-muted)] hover:border-[color-mix(in_oklch,var(--nestora-sage)_28%,var(--border))]',
            focusRing,
          )}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      </span>
    </label>
  );
}

export function AdminBedsFiltersBar(props: AdminBedsFiltersBarProps) {
  const {
    search,
    onSearchChange,
    hostelFilter,
    onHostelFilterChange,
    blockFilter,
    onBlockFilterChange,
    floorFilter,
    onFloorFilterChange,
    roomFilter,
    onRoomFilterChange,
    statusFilter,
    onStatusFilterChange,
    onReset,
    filteredCount,
    hostelOptions,
    blockOptions,
    floorOptions,
    roomOptions,
  } = props;

  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const hostelOpts = hostelOptions ?? BED_HOSTEL_FILTER_OPTIONS;
  const blockOpts = blockOptions ?? BED_BLOCK_FILTER_OPTIONS;
  const floorOpts = floorOptions ?? BED_FLOOR_FILTER_OPTIONS;
  const roomOpts = roomOptions ?? BED_ROOM_FILTER_OPTIONS;

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (search.trim()) count += 1;
    if (hostelFilter !== 'All Hostels') count += 1;
    if (blockFilter !== 'All Blocks') count += 1;
    if (floorFilter !== 'All Floors') count += 1;
    if (roomFilter !== 'All Rooms') count += 1;
    if (statusFilter !== 'All Status') count += 1;
    return count;
  }, [search, hostelFilter, blockFilter, floorFilter, roomFilter, statusFilter]);

  useGSAP(
    () => {
      if (reduceMotion || !sectionRef.current) return;
      gsap.from(sectionRef.current.querySelectorAll('[data-beds-filter-field]'), {
        opacity: 0,
        y: 10,
        duration: 0.32,
        stagger: 0.04,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: sectionRef, dependencies: [reduceMotion] },
  );

  return (
    <section
      ref={sectionRef}
      data-beds-reveal
      className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_20%,var(--border))] bg-card p-4 shadow-sm sm:p-5"
      aria-labelledby="beds-filters-heading"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl border border-[var(--nestora-sage-muted)] bg-[color-mix(in_oklch,var(--nestora-cream)_22%,var(--card))]">
            <SlidersHorizontal className="size-4 text-[var(--nestora-forest)]" aria-hidden />
          </span>
          <div>
            <h2 id="beds-filters-heading" className="text-sm font-semibold text-[var(--nestora-forest)]">
              Search &amp; filters
            </h2>
            <p className="text-xs text-muted-foreground">
              Bed ID, room, or student · <span className="font-semibold tabular-nums">{filteredCount}</span> matches
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {activeFilterCount > 0 ? (
              <motion.span
                initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0, scale: 0.92 }}
                className="inline-flex items-center gap-1 rounded-full border border-[color-mix(in_oklch,var(--nestora-gold)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_12%,var(--card))] px-2.5 py-1 text-[11px] font-semibold text-[var(--nestora-forest)]"
              >
                <Sparkles className="size-3" aria-hidden />
                {activeFilterCount} active
              </motion.span>
            ) : null}
          </AnimatePresence>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 rounded-xl"
            onClick={onReset}
            disabled={activeFilterCount === 0}
          >
            <RotateCcw className="size-3.5" aria-hidden />
            Reset
          </Button>
        </div>
      </div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: motionEase }}
        className="grid gap-3 lg:grid-cols-12"
      >
        <label data-beds-filter-field className="flex flex-col gap-1.5 lg:col-span-4">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            <Search className="size-3" aria-hidden />
            Search
          </span>
          <div className="relative">
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Bed ID, room, student name or ID…"
              className="h-10 rounded-xl border-[var(--nestora-sage-muted)] pr-9"
            />
            {search ? (
              <button type="button" className={cn('absolute top-1/2 right-2.5 -translate-y-1/2', focusRing)} onClick={() => onSearchChange('')} aria-label="Clear search">
                <X className="size-4 text-muted-foreground" />
              </button>
            ) : null}
          </div>
        </label>
        <div className="grid gap-3 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-3">
          <FilterField label="Hostel" icon={<Building2 className="size-3" aria-hidden />} value={hostelFilter} options={hostelOpts} onChange={onHostelFilterChange} active={hostelFilter !== 'All Hostels'} />
          <FilterField label="Block" icon={<Layers className="size-3" aria-hidden />} value={blockFilter} options={blockOpts} onChange={onBlockFilterChange} active={blockFilter !== 'All Blocks'} />
          <FilterField label="Floor" icon={<LayoutTemplate className="size-3" aria-hidden />} value={floorFilter} options={floorOpts} onChange={onFloorFilterChange} active={floorFilter !== 'All Floors'} />
          <FilterField label="Room" icon={<DoorOpen className="size-3" aria-hidden />} value={roomFilter} options={roomOpts} onChange={onRoomFilterChange} active={roomFilter !== 'All Rooms'} />
          <FilterField label="Bed status" icon={<CircleDot className="size-3" aria-hidden />} value={statusFilter} options={BED_STATUS_FILTER_OPTIONS} onChange={onStatusFilterChange} active={statusFilter !== 'All Status'} />
        </div>
      </motion.div>
    </section>
  );
}
