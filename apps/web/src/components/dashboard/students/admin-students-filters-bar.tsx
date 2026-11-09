'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Building2,
  ChevronDown,
  GraduationCap,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  CalendarRange,
  CircleDot,
  X,
} from 'lucide-react';
import { useMemo, useRef, type ReactNode } from 'react';

import {
  COURSE_FILTER_OPTIONS,
  HOSTEL_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
  YEAR_FILTER_OPTIONS,
} from '@/components/dashboard/students/admin-students-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type AdminStudentsFiltersBarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  hostelFilter: string;
  onHostelFilterChange: (value: string) => void;
  courseFilter: string;
  onCourseFilterChange: (value: string) => void;
  yearFilter: string;
  onYearFilterChange: (value: string) => void;
  onReset: () => void;
  filteredCount: number;
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
    <label
      data-students-filter-field
      className="flex min-w-0 flex-col gap-1.5"
    >
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
            'transition-[border-color,box-shadow] duration-200',
            active
              ? 'border-[color-mix(in_oklch,var(--nestora-sage)_42%,var(--border))] shadow-[0_0_0_3px_color-mix(in_srgb,var(--nestora-sage)_12%,transparent)]'
              : 'border-[var(--nestora-sage-muted)] hover:border-[color-mix(in_oklch,var(--nestora-sage)_28%,var(--border))]',
            'focus-visible:border-[var(--nestora-sage)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--nestora-sage)_22%,transparent)]',
            focusRing,
          )}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
      </span>
    </label>
  );
}

export function AdminStudentsFiltersBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  hostelFilter,
  onHostelFilterChange,
  courseFilter,
  onCourseFilterChange,
  yearFilter,
  onYearFilterChange,
  onReset,
  filteredCount,
}: AdminStudentsFiltersBarProps) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; clear: () => void }[] = [];
    const q = search.trim();
    if (q) {
      chips.push({ key: 'search', label: `“${q}”`, clear: () => onSearchChange('') });
    }
    if (statusFilter !== 'All Status') {
      chips.push({ key: 'status', label: statusFilter, clear: () => onStatusFilterChange('All Status') });
    }
    if (hostelFilter !== 'All Hostels') {
      chips.push({ key: 'hostel', label: hostelFilter, clear: () => onHostelFilterChange('All Hostels') });
    }
    if (courseFilter !== 'All Courses') {
      chips.push({ key: 'course', label: courseFilter, clear: () => onCourseFilterChange('All Courses') });
    }
    if (yearFilter !== 'All Years') {
      chips.push({ key: 'year', label: yearFilter, clear: () => onYearFilterChange('All Years') });
    }
    return chips;
  }, [
    search,
    statusFilter,
    hostelFilter,
    courseFilter,
    yearFilter,
    onSearchChange,
    onStatusFilterChange,
    onHostelFilterChange,
    onCourseFilterChange,
    onYearFilterChange,
  ]);

  const hasActiveFilters = activeChips.length > 0;

  useGSAP(
    () => {
      if (reduceMotion || !sectionRef.current) {
        return;
      }
      gsap.from(sectionRef.current.querySelectorAll('[data-students-filter-field]'), {
        opacity: 0,
        y: 10,
        duration: 0.38,
        stagger: 0.05,
        ease: 'power2.out',
        delay: 0.05,
        clearProps: 'opacity,transform',
      });
    },
    { scope: sectionRef, dependencies: [reduceMotion] },
  );

  return (
    <section
      ref={sectionRef}
      aria-label="Search and filters"
      className="relative overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-cream)_18%,var(--card))] shadow-sm"
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-[color-mix(in_oklch,var(--nestora-sage)_55%,var(--nestora-forest))]"
        aria-hidden
      />
      <div className="px-4 py-4 pl-5 sm:px-5 sm:py-5 sm:pl-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[var(--nestora-sage-muted)] bg-card shadow-sm">
              <SlidersHorizontal className="size-4 text-[var(--nestora-forest)]" aria-hidden />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--nestora-sage)]">Filters</p>
              <h2 className="text-base font-semibold text-[var(--nestora-forest)]">Refine directory</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                <span className="font-semibold tabular-nums text-foreground">{filteredCount}</span> matches with current
                rules
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {hasActiveFilters ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-[color-mix(in_oklch,var(--nestora-sage)_30%,var(--border))] bg-card/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--nestora-forest)]">
                <Sparkles className="size-3 text-[var(--nestora-sage)]" aria-hidden />
                {activeChips.length} active
              </span>
            ) : (
              <span className="text-[11px] text-muted-foreground">No filters applied</span>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!hasActiveFilters}
              onClick={onReset}
              className={cn(
                'rounded-xl border-[var(--nestora-sage-muted)] bg-card/90 shadow-sm',
                hasActiveFilters && 'hover:border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))]',
              )}
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
          className="grid gap-3 lg:grid-cols-12 lg:gap-3"
        >
          <label
            data-students-filter-field
            className="flex min-w-0 flex-col gap-1.5 lg:col-span-5"
          >
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <span className="flex size-5 items-center justify-center rounded-md border border-[var(--nestora-sage-muted)]/80 bg-card/90 text-[var(--nestora-forest)]">
                <Search className="size-3" aria-hidden />
              </span>
              Search
            </span>
            <span className="group relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-[var(--nestora-forest)]"
                aria-hidden
              />
              <Input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Name, ID, email, phone…"
                className={cn(
                  'h-11 rounded-xl border-[var(--nestora-sage-muted)] bg-card/95 pl-9 shadow-sm',
                  'transition-[border-color,box-shadow] duration-200',
                  'focus-visible:border-[var(--nestora-sage)] focus-visible:ring-[color-mix(in_srgb,var(--nestora-sage)_18%,transparent)]',
                  search.trim() &&
                    'border-[color-mix(in_oklch,var(--nestora-sage)_42%,var(--border))] shadow-[0_0_0_3px_color-mix(in_srgb,var(--nestora-sage)_12%,transparent)]',
                )}
              />
              {!search.trim() ? (
                <kbd className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded-md border border-border/70 bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
                  /
                </kbd>
              ) : null}
            </span>
          </label>

          <div className="grid gap-3 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-4">
            <FilterField
              label="Status"
              icon={<CircleDot className="size-3" aria-hidden />}
              value={statusFilter}
              options={STATUS_FILTER_OPTIONS}
              onChange={onStatusFilterChange}
              active={statusFilter !== 'All Status'}
            />
            <FilterField
              label="Hostel"
              icon={<Building2 className="size-3" aria-hidden />}
              value={hostelFilter}
              options={HOSTEL_FILTER_OPTIONS}
              onChange={onHostelFilterChange}
              active={hostelFilter !== 'All Hostels'}
            />
            <FilterField
              label="Course"
              icon={<GraduationCap className="size-3" aria-hidden />}
              value={courseFilter}
              options={COURSE_FILTER_OPTIONS}
              onChange={onCourseFilterChange}
              active={courseFilter !== 'All Courses'}
            />
            <FilterField
              label="Year"
              icon={<CalendarRange className="size-3" aria-hidden />}
              value={yearFilter}
              options={YEAR_FILTER_OPTIONS}
              onChange={onYearFilterChange}
              active={yearFilter !== 'All Years'}
            />
          </div>
        </motion.div>

        <AnimatePresence initial={false}>
          {hasActiveFilters ? (
            <motion.div
              initial={reduceMotion ? false : { height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: motionEase }}
              className="overflow-hidden"
            >
              <ul className="mt-4 flex flex-wrap gap-2 border-t border-[var(--nestora-sage-muted)]/70 pt-4">
                {activeChips.map((chip, index) => (
                  <motion.li
                    key={chip.key}
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.2, delay: index * 0.03, ease: motionEase }}
                  >
                    <button
                      type="button"
                      onClick={chip.clear}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_oklch,var(--nestora-sage)_28%,var(--border))] bg-card px-2.5 py-1 text-xs font-medium text-foreground shadow-sm',
                        'transition-colors hover:border-[color-mix(in_oklch,var(--nestora-sage)_40%,var(--border))] hover:bg-[color-mix(in_oklch,var(--nestora-sage)_8%,var(--card))]',
                        focusRing,
                      )}
                    >
                      <span className="max-w-[12rem] truncate">{chip.label}</span>
                      <X className="size-3 text-muted-foreground" aria-hidden />
                      <span className="sr-only">Remove filter</span>
                    </button>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}
