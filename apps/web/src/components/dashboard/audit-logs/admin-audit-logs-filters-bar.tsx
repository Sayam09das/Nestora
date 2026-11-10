'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { RotateCcw, Search } from 'lucide-react';
import { useMemo } from 'react';

import {
  AUDIT_CATEGORY_FILTERS,
  AUDIT_SEVERITY_FILTERS,
} from '@/components/dashboard/audit-logs/admin-audit-logs-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (v: string) => void;
  severityFilter: string;
  onSeverityFilterChange: (v: string) => void;
  actionFilter: string;
  onActionFilterChange: (v: string) => void;
  onReset: () => void;
  onApplyApi?: () => void;
  loading?: boolean;
};

export function AdminAuditLogsFiltersBar(props: Props) {
  const reduceMotion = useReducedMotion();
  const active = useMemo(() => {
    let n = 0;
    if (props.search.trim()) n++;
    if (props.categoryFilter !== 'All categories') n++;
    if (props.severityFilter !== 'All severity') n++;
    if (props.actionFilter.trim()) n++;
    return n;
  }, [props]);

  const selectClass = cn('h-9 min-w-[8.5rem] rounded-xl border bg-card px-2.5 text-xs sm:text-sm', focusRing);

  return (
    <motion.section
      data-aud-reveal
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">Query trail</h2>
        <div className="flex gap-2">
          {props.onApplyApi ? (
            <Button type="button" size="sm" variant="secondary" className={cn('h-8 rounded-lg text-xs', focusRing)} onClick={props.onApplyApi} disabled={props.loading}>
              Refresh API
            </Button>
          ) : null}
          <Button type="button" variant="ghost" size="sm" className={cn('h-8 gap-1 rounded-lg text-xs', focusRing)} onClick={props.onReset}>
            <RotateCcw className="size-3.5" aria-hidden />
            Reset
          </Button>
        </div>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr,auto,auto,1fr]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={props.search}
            onChange={(e) => props.onSearchChange(e.target.value)}
            placeholder="Search action, entity, actor…"
            className={cn('h-10 rounded-xl pl-9', focusRing)}
          />
        </label>
        <select value={props.categoryFilter} onChange={(e) => props.onCategoryFilterChange(e.target.value)} className={selectClass}>
          {AUDIT_CATEGORY_FILTERS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={props.severityFilter} onChange={(e) => props.onSeverityFilterChange(e.target.value)} className={selectClass}>
          {AUDIT_SEVERITY_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <Input
          value={props.actionFilter}
          onChange={(e) => props.onActionFilterChange(e.target.value)}
          placeholder="Action name filter (API)"
          className={cn('h-10 rounded-xl font-mono text-xs', focusRing)}
          aria-label="Action name filter"
        />
      </div>
      {active > 0 ? <p className="mt-2 text-[10px] font-semibold uppercase text-muted-foreground">{active} filters active</p> : null}
    </motion.section>
  );
}
