'use client';

import { RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import { useMemo, useRef } from 'react';

import {
  ROOM_TYPE_CAPACITY_FILTERS,
  ROOM_TYPE_CATEGORY_FILTERS,
  ROOM_TYPE_HOSTEL_FILTERS,
  ROOM_TYPE_PRICE_FILTERS,
  ROOM_TYPE_STATUS_FILTERS,
} from '@/components/dashboard/room-types/admin-room-types-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

export type AdminRoomTypesFiltersBarProps = {
  search: string;
  onSearchChange: (v: string) => void;
  hostelFilter: string;
  onHostelFilterChange: (v: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (v: string) => void;
  capacityFilter: string;
  onCapacityFilterChange: (v: string) => void;
  priceFilter: string;
  onPriceFilterChange: (v: string) => void;
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
  onReset: () => void;
  filteredCount: number;
  hostelOptions?: readonly string[];
  categoryOptions?: readonly string[];
};

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
    <label data-rt-filter className="flex flex-col gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn('h-10 rounded-xl border border-[var(--nestora-sage-muted)] bg-card px-3 text-sm', focusRing)}
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

export function AdminRoomTypesFiltersBar(props: AdminRoomTypesFiltersBarProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const active = useMemo(() => {
    let n = 0;
    if (props.search.trim()) n++;
    if (props.hostelFilter !== 'All Hostels') n++;
    if (props.categoryFilter !== 'All Categories') n++;
    if (props.capacityFilter !== 'All Capacity') n++;
    if (props.priceFilter !== 'All Pricing') n++;
    if (props.statusFilter !== 'All Status') n++;
    return n;
  }, [props]);

  useGSAP(
    () => {
      if (!sectionRef.current) return;
      gsap.from(sectionRef.current.querySelectorAll('[data-rt-filter]'), {
        opacity: 0,
        y: 8,
        stagger: 0.04,
        duration: 0.32,
        clearProps: 'opacity,transform',
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} data-rt-reveal className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_20%,var(--border))] bg-card p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-[var(--nestora-forest)]" aria-hidden />
          <span className="text-sm font-semibold text-[var(--nestora-forest)]">Search &amp; filters</span>
        </div>
        <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={props.onReset} disabled={active === 0}>
          <RotateCcw className="size-3.5" aria-hidden />
          Reset
        </Button>
      </div>
      <div className="grid gap-3 lg:grid-cols-12">
        <label data-rt-filter className="lg:col-span-4">
          <span className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase text-muted-foreground">
            <Search className="size-3" aria-hidden />
            Search
          </span>
          <div className="relative">
            <Input
              value={props.search}
              onChange={(e) => props.onSearchChange(e.target.value)}
              placeholder="Name, code, or description…"
              className="h-10 rounded-xl pr-9"
            />
            {props.search ? (
              <button type="button" className="absolute top-1/2 right-2 -translate-y-1/2" onClick={() => props.onSearchChange('')} aria-label="Clear">
                <X className="size-4 text-muted-foreground" />
              </button>
            ) : null}
          </div>
        </label>
        <div className="grid gap-3 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-3">
          <SelectField
            label="Hostel"
            value={props.hostelFilter}
            options={props.hostelOptions ?? ROOM_TYPE_HOSTEL_FILTERS}
            onChange={props.onHostelFilterChange}
          />
          <SelectField
            label="Category"
            value={props.categoryFilter}
            options={props.categoryOptions ?? ROOM_TYPE_CATEGORY_FILTERS}
            onChange={props.onCategoryFilterChange}
          />
          <SelectField label="Capacity" value={props.capacityFilter} options={ROOM_TYPE_CAPACITY_FILTERS} onChange={props.onCapacityFilterChange} />
          <SelectField label="Pricing" value={props.priceFilter} options={ROOM_TYPE_PRICE_FILTERS} onChange={props.onPriceFilterChange} />
          <SelectField label="Status" value={props.statusFilter} options={ROOM_TYPE_STATUS_FILTERS} onChange={props.onStatusFilterChange} />
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {props.filteredCount} types match · {active > 0 ? `${active} filters active` : 'No filters'}
      </p>
    </section>
  );
}
