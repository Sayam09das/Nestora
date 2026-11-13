'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { RotateCcw, Search } from 'lucide-react';
import { useMemo } from 'react';

import { FEE_STATUS_FILTERS } from '@/components/dashboard/fees/admin-fees-data';
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
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
  onReset: () => void;
  hostelOptions: readonly string[];
};

export function AdminFeesFiltersBar(props: Props) {
  const reduceMotion = useReducedMotion();
  const active = useMemo(() => {
    let n = 0;
    if (props.search.trim()) n++;
    if (props.hostelFilter !== 'All hostels') n++;
    if (props.statusFilter !== 'All status') n++;
    return n;
  }, [props]);

  const selectClass = cn('h-9 min-w-[8.5rem] rounded-xl border bg-card px-2.5 text-xs sm:text-sm', focusRing);

  return (
    <motion.section
      data-fee-reveal
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">Filter ledgers</h2>
        <div className="flex items-center gap-2">
          {active > 0 ? (
            <span className="text-[11px] text-muted-foreground">
              {active} filter{active === 1 ? '' : 's'} active
            </span>
          ) : null}
          <Button type="button" variant="ghost" size="sm" className={cn('h-8 gap-1 rounded-lg text-xs', focusRing)} onClick={props.onReset}>
            <RotateCcw className="size-3.5" aria-hidden />
            Reset
          </Button>
        </div>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr,auto,auto]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={props.search}
            onChange={(e) => props.onSearchChange(e.target.value)}
            placeholder="Search student, reg no, room…"
            className={cn('h-10 rounded-xl pl-9', focusRing)}
          />
        </label>
        <select value={props.hostelFilter} onChange={(e) => props.onHostelFilterChange(e.target.value)} className={selectClass}>
            {props.hostelOptions.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        <select value={props.statusFilter} onChange={(e) => props.onStatusFilterChange(e.target.value)} className={selectClass}>
          {FEE_STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </motion.section>
  );
}
