'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Building2, MapPin, RotateCcw, Search, SlidersHorizontal, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  HOSTEL_CAMPUS_FILTERS,
  HOSTEL_GENDER_FILTERS,
  HOSTEL_OCCUPANCY_FILTERS,
  HOSTEL_STATUS_FILTERS,
} from '@/components/dashboard/hostels/admin-hostels-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  genderFilter: string;
  onGenderFilterChange: (v: string) => void;
  campusFilter: string;
  onCampusFilterChange: (v: string) => void;
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
  occupancyFilter: string;
  onOccupancyFilterChange: (v: string) => void;
  onReset: () => void;
  campusOptions?: readonly string[];
  genderOptions?: readonly string[];
};

function SelectField({
  label,
  value,
  options,
  onChange,
  icon,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
  icon?: React.ReactNode;
}) {
  const id = `hostel-filter-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <label className="block space-y-1">
      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        {icon}
        {label}
      </span>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'h-10 w-full min-w-[9.5rem] rounded-xl border border-input bg-background px-3 text-sm',
          focusRing,
        )}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}

export function AdminHostelsFiltersBar(props: Props) {
  const reduceMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(true);

  const genderOpts = props.genderOptions ?? HOSTEL_GENDER_FILTERS;
  const campusOpts = props.campusOptions ?? HOSTEL_CAMPUS_FILTERS;

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (props.search.trim()) n++;
    if (props.genderFilter !== 'All Categories') n++;
    if (props.campusFilter !== 'All Campus Zones') n++;
    if (props.statusFilter !== 'All Status') n++;
    if (props.occupancyFilter !== 'All Occupancy') n++;
    return n;
  }, [props]);

  return (
    <motion.section
      data-hostel-reveal
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card p-4 shadow-sm sm:p-5"
      aria-label="Search and filters"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">Search &amp; filters</h2>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 ? (
            <span className="rounded-full bg-[color-mix(in_oklch,var(--nestora-sage-light)_45%,var(--card))] px-2 py-0.5 text-[10px] font-semibold text-[var(--nestora-forest)]">
              {activeFilterCount} active
            </span>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn('h-8 rounded-lg text-xs', focusRing)}
            onClick={() => setExpanded((e) => !e)}
          >
            <SlidersHorizontal className="size-3.5" aria-hidden />
            {expanded ? 'Collapse' : 'Expand'}
          </Button>
          <Button type="button" variant="outline" size="sm" className={cn('h-8 rounded-lg text-xs', focusRing)} onClick={props.onReset}>
            <RotateCcw className="size-3.5" aria-hidden />
            Reset
          </Button>
        </div>
      </div>
      {expanded ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_repeat(4,minmax(0,1fr))]">
          <label className="block space-y-1 lg:col-span-1">
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <Search className="size-3" aria-hidden />
              Search
            </span>
            <Input
              value={props.search}
              onChange={(e) => props.onSearchChange(e.target.value)}
              placeholder="Name, code, address, warden…"
              className={cn('h-10 rounded-xl', focusRing)}
            />
          </label>
          <SelectField
            label="Gender category"
            icon={<Users className="size-3" aria-hidden />}
            value={props.genderFilter}
            options={genderOpts}
            onChange={props.onGenderFilterChange}
          />
          <SelectField
            label="Campus zone"
            icon={<MapPin className="size-3" aria-hidden />}
            value={props.campusFilter}
            options={campusOpts}
            onChange={props.onCampusFilterChange}
          />
          <SelectField
            label="Status"
            icon={<Building2 className="size-3" aria-hidden />}
            value={props.statusFilter}
            options={HOSTEL_STATUS_FILTERS}
            onChange={props.onStatusFilterChange}
          />
          <SelectField label="Occupancy" value={props.occupancyFilter} options={HOSTEL_OCCUPANCY_FILTERS} onChange={props.onOccupancyFilterChange} />
        </div>
      ) : null}
    </motion.section>
  );
}
