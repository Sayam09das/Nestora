'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { RotateCcw, Search } from 'lucide-react';
import { useMemo } from 'react';

import {
  ALLOCATION_HOSTEL_FILTERS,
  ALLOCATION_STATUS_FILTERS,
  ALLOCATION_TYPE_FILTERS,
} from '@/components/dashboard/allocation/admin-allocation-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
  typeFilter: string;
  onTypeFilterChange: (v: string) => void;
  hostelFilter: string;
  onHostelFilterChange: (v: string) => void;
  onReset: () => void;
};

export function AdminAllocationFiltersBar(props: Props) {
  const reduceMotion = useReducedMotion();

  const active = useMemo(() => {
    let n = 0;
    if (props.search.trim()) n++;
    if (props.statusFilter !== 'All Status') n++;
    if (props.typeFilter !== 'All Types') n++;
    if (props.hostelFilter !== 'All Hostels') n++;
    return n;
  }, [props]);

  return (
    <motion.section
      data-alloc-reveal
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card p-4 shadow-sm sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">Filters</h2>
        <motion.div className="flex items-center gap-2">
          {active > 0 ? <span className="text-[10px] font-semibold uppercase text-muted-foreground">{active} active</span> : null}
          <Button type="button" variant="outline" size="sm" className={cn('h-8 rounded-lg text-xs', focusRing)} onClick={props.onReset}>
            <RotateCcw className="size-3.5" aria-hidden />
            Reset
          </Button>
        </motion.div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block space-y-1 sm:col-span-2 lg:col-span-1">
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            <Search className="size-3" aria-hidden />
            Search
          </span>
          <Input
            value={props.search}
            onChange={(e) => props.onSearchChange(e.target.value)}
            placeholder="Student, ref, bed ID…"
            className={cn('h-10 rounded-xl', focusRing)}
          />
        </label>
        <FilterSelect label="Status" value={props.statusFilter} options={ALLOCATION_STATUS_FILTERS} onChange={props.onStatusFilterChange} />
        <FilterSelect label="Type" value={props.typeFilter} options={ALLOCATION_TYPE_FILTERS} onChange={props.onTypeFilterChange} />
        <FilterSelect label="Hostel" value={props.hostelFilter} options={ALLOCATION_HOSTEL_FILTERS} onChange={props.onHostelFilterChange} />
      </div>
    </motion.section>
  );
}

function FilterSelect({
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
