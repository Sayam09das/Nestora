'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { RotateCcw, Search } from 'lucide-react';
import { useMemo } from 'react';

import {
  ROLE_RISK_FILTERS,
  ROLE_SCOPE_FILTERS,
  ROLE_TIER_FILTERS,
} from '@/components/dashboard/roles/admin-roles-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  tierFilter: string;
  onTierFilterChange: (v: string) => void;
  scopeFilter: string;
  onScopeFilterChange: (v: string) => void;
  riskFilter: string;
  onRiskFilterChange: (v: string) => void;
  onReset: () => void;
};

export function AdminRolesFiltersBar(props: Props) {
  const reduceMotion = useReducedMotion();
  const active = useMemo(() => {
    let n = 0;
    if (props.search.trim()) n++;
    if (props.tierFilter !== 'All tiers') n++;
    if (props.scopeFilter !== 'All scopes') n++;
    if (props.riskFilter !== 'All risk') n++;
    return n;
  }, [props]);

  const selectClass = cn('h-9 min-w-[8.5rem] rounded-xl border bg-card px-2.5 text-xs sm:text-sm', focusRing);

  return (
    <motion.section
      data-role-reveal
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">Filter roles</h2>
        <Button type="button" variant="ghost" size="sm" className={cn('h-8 gap-1 rounded-lg text-xs', focusRing)} onClick={props.onReset}>
          <RotateCcw className="size-3.5" aria-hidden />
          Reset
        </Button>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr,auto,auto,auto]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={props.search}
            onChange={(e) => props.onSearchChange(e.target.value)}
            placeholder="Search roles or FR refs…"
            className={cn('h-10 rounded-xl pl-9', focusRing)}
          />
        </label>
        <select value={props.tierFilter} onChange={(e) => props.onTierFilterChange(e.target.value)} className={selectClass}>
          {ROLE_TIER_FILTERS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select value={props.scopeFilter} onChange={(e) => props.onScopeFilterChange(e.target.value)} className={selectClass}>
          {ROLE_SCOPE_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={props.riskFilter} onChange={(e) => props.onRiskFilterChange(e.target.value)} className={selectClass}>
          {ROLE_RISK_FILTERS.map((r) => (
            <option key={r} value={r}>
              {r === 'All risk' ? r : `${r} risk`}
            </option>
          ))}
        </select>
      </div>
      {active > 0 ? <p className="mt-2 text-[10px] font-semibold uppercase text-muted-foreground">{active} filters active</p> : null}
    </motion.section>
  );
}
