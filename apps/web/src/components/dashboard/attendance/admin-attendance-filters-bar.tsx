'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { RotateCcw, Search } from 'lucide-react';
import { useMemo } from 'react';

import { ATTENDANCE_MARK_FILTERS } from '@/components/dashboard/attendance/admin-attendance-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  hostelFilter: string;
  onHostelFilterChange: (v: string) => void;
  blockFilter: string;
  onBlockFilterChange: (v: string) => void;
  floorFilter: string;
  onFloorFilterChange: (v: string) => void;
  markFilter: string;
  onMarkFilterChange: (v: string) => void;
  onReset: () => void;
  onBulkFloorPresent: () => void;
  hostelOptions: readonly string[];
  blockOptions: readonly string[];
  floorOptions: readonly string[];
  /** When false, hostel is fixed by warden topbar scope (default true). */
  showHostelFilter?: boolean;
};

export function AdminAttendanceFiltersBar(props: Props) {
  const reduceMotion = useReducedMotion();
  const active = useMemo(() => {
    let n = 0;
    if (props.search.trim()) n++;
    if (props.showHostelFilter !== false && props.hostelFilter !== 'All Hostels') n++;
    if (props.blockFilter !== 'All Blocks') n++;
    if (props.floorFilter !== 'All Floors') n++;
    if (props.markFilter !== 'All Marks') n++;
    return n;
  }, [props]);

  return (
    <motion.section
      data-att-reveal
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card p-4 shadow-sm sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">Roster filters</h2>
        <div className="flex flex-wrap items-center gap-2">
          {active > 0 ? <span className="text-[10px] font-semibold uppercase text-muted-foreground">{active} active</span> : null}
          <Button type="button" variant="secondary" size="sm" className={cn('h-8 rounded-lg text-xs', focusRing)} onClick={props.onBulkFloorPresent}>
            Mark floor present
          </Button>
          <Button type="button" variant="outline" size="sm" className={cn('h-8 rounded-lg text-xs', focusRing)} onClick={props.onReset}>
            <RotateCcw className="size-3.5" aria-hidden />
            Reset
          </Button>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <label className="block space-y-1 lg:col-span-2">
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            <Search className="size-3" aria-hidden />
            Search
          </span>
          <Input
            value={props.search}
            onChange={(e) => props.onSearchChange(e.target.value)}
            placeholder="Name, ID, room…"
            className={cn('h-10 rounded-xl', focusRing)}
          />
        </label>
        {props.showHostelFilter !== false ? (
          <SelectField label="Hostel" value={props.hostelFilter} options={props.hostelOptions} onChange={props.onHostelFilterChange} />
        ) : null}
        <SelectField label="Block" value={props.blockFilter} options={props.blockOptions} onChange={props.onBlockFilterChange} />
        <SelectField label="Floor" value={props.floorFilter} options={props.floorOptions} onChange={props.onFloorFilterChange} />
        <SelectField label="Mark" value={props.markFilter} options={ATTENDANCE_MARK_FILTERS} onChange={props.onMarkFilterChange} />
      </div>
    </motion.section>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn('h-10 w-full rounded-xl border px-3 text-sm', focusRing)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
