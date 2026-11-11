'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { RotateCcw, Search } from 'lucide-react';

import {
  BLOCK_FILTER_OPTIONS,
  FLOOR_FILTER_OPTIONS,
  OCCUPANCY_FILTER_OPTIONS,
  ROOM_TYPE_FILTER_OPTIONS,
} from '@/components/dashboard/rooms/admin-rooms-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  blockFilter: string;
  onBlockFilterChange: (v: string) => void;
  floorFilter: string;
  onFloorFilterChange: (v: string) => void;
  roomTypeFilter: string;
  onRoomTypeFilterChange: (v: string) => void;
  occupancyFilter: string;
  onOccupancyFilterChange: (v: string) => void;
  filteredCount: number;
  blockOptions?: readonly string[];
  floorOptions?: readonly string[];
  roomTypeOptions?: readonly string[];
  onReset: () => void;
};

export function WardenRoomsFilters({
  search,
  onSearchChange,
  blockFilter,
  onBlockFilterChange,
  floorFilter,
  onFloorFilterChange,
  roomTypeFilter,
  onRoomTypeFilterChange,
  occupancyFilter,
  onOccupancyFilterChange,
  filteredCount,
  blockOptions = BLOCK_FILTER_OPTIONS,
  floorOptions = FLOOR_FILTER_OPTIONS,
  roomTypeOptions = ROOM_TYPE_FILTER_OPTIONS,
  onReset,
}: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3 rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_16%,var(--border))] bg-card p-4 shadow-sm"
      aria-label="Room and bed filters"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold text-muted-foreground">{filteredCount} rooms in view</p>
        <Button type="button" variant="ghost" size="sm" className={cn('rounded-lg', focusRing)} onClick={onReset}>
          <RotateCcw className="size-3.5" aria-hidden />
          Reset
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        <label className="flex flex-col gap-1.5 lg:col-span-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Search</span>
          <span className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Room no., block, resident…"
              className="h-9 rounded-xl pl-9"
            />
          </span>
        </label>
        {(
          [
            [blockFilter, onBlockFilterChange, 'Block', blockOptions],
            [floorFilter, onFloorFilterChange, 'Floor', floorOptions],
            [roomTypeFilter, onRoomTypeFilterChange, 'Room type', roomTypeOptions],
            [occupancyFilter, onOccupancyFilterChange, 'Vacancy', OCCUPANCY_FILTER_OPTIONS],
          ] as const
        ).map(([value, onChange, label, options]) => (
          <label key={label} className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</span>
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={cn('h-9 rounded-xl border border-border bg-background px-2.5 text-sm', focusRing)}
            >
              {options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </motion.section>
  );
}
