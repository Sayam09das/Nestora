'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { RotateCcw, Search } from 'lucide-react';
import { useMemo } from 'react';

import {
  COMPLAINT_CATEGORY_FILTERS,
  COMPLAINT_PRIORITY_FILTERS,
  COMPLAINT_STATUS_FILTERS,
} from '@/components/dashboard/complaints/admin-complaints-data';
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
  categoryFilter: string;
  onCategoryFilterChange: (v: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (v: string) => void;
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
  onReset: () => void;
  hostelOptions: readonly string[];
  showHostelFilter?: boolean;
};

export function AdminComplaintsFiltersBar(props: Props) {
  const reduceMotion = useReducedMotion();
  const active = useMemo(() => {
    let n = 0;
    if (props.search.trim()) n++;
    if (props.showHostelFilter !== false && props.hostelFilter !== 'All Hostels') n++;
    if (props.categoryFilter !== 'All Categories') n++;
    if (props.priorityFilter !== 'All Priorities') n++;
    if (props.statusFilter !== 'All Status') n++;
    return n;
  }, [props]);

  const selectClass = cn('h-9 min-w-[8.5rem] rounded-xl border bg-card px-2.5 text-xs sm:text-sm', focusRing);

  return (
    <motion.section
      data-cmp-reveal
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card p-4 shadow-sm sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">Ticket filters</h2>
        <div className="flex items-center gap-2">
          {active > 0 ? (
            <span className="text-[10px] font-semibold uppercase text-muted-foreground">{active} active</span>
          ) : null}
          <Button type="button" variant="ghost" size="sm" className={cn('h-8 gap-1 rounded-lg text-xs', focusRing)} onClick={props.onReset}>
            <RotateCcw className="size-3.5" aria-hidden />
            Reset
          </Button>
        </div>
      </div>
      <div
        className={cn(
          'mt-4 grid gap-3',
          props.showHostelFilter !== false
            ? 'lg:grid-cols-[1fr,auto,auto,auto,auto]'
            : 'lg:grid-cols-[1fr,auto,auto,auto]',
        )}
      >
        <label className="relative block">
          <span className="sr-only">Search tickets</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={props.search}
            onChange={(e) => props.onSearchChange(e.target.value)}
            placeholder="Ticket #, student, room, title…"
            className={cn('h-10 rounded-xl pl-9', focusRing)}
          />
        </label>
        {props.showHostelFilter !== false ? (
          <select value={props.hostelFilter} onChange={(e) => props.onHostelFilterChange(e.target.value)} className={selectClass}>
            {props.hostelOptions.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        ) : null}
        <select value={props.categoryFilter} onChange={(e) => props.onCategoryFilterChange(e.target.value)} className={selectClass}>
          {COMPLAINT_CATEGORY_FILTERS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={props.priorityFilter} onChange={(e) => props.onPriorityFilterChange(e.target.value)} className={selectClass}>
          {COMPLAINT_PRIORITY_FILTERS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select value={props.statusFilter} onChange={(e) => props.onStatusFilterChange(e.target.value)} className={selectClass}>
          {COMPLAINT_STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </motion.section>
  );
}
