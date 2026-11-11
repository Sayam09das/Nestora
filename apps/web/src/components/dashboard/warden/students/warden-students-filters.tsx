'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { GraduationCap, RotateCcw, Search, Sparkles } from 'lucide-react';

import {
  COURSE_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
  YEAR_FILTER_OPTIONS,
} from '@/components/dashboard/students/admin-students-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  courseFilter: string;
  onCourseFilterChange: (value: string) => void;
  yearFilter: string;
  onYearFilterChange: (value: string) => void;
  onReset: () => void;
  filteredCount: number;
  courseOptions?: readonly string[];
  yearOptions?: readonly string[];
  lockStatus?: boolean;
};

export function WardenStudentsFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  courseFilter,
  onCourseFilterChange,
  yearFilter,
  onYearFilterChange,
  onReset,
  filteredCount,
  courseOptions = COURSE_FILTER_OPTIONS,
  yearOptions = YEAR_FILTER_OPTIONS,
  lockStatus = false,
}: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3 rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_16%,var(--border))] bg-card p-4 shadow-sm"
      aria-label="Student filters"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Sparkles className="size-3.5 text-[var(--nestora-gold)]" aria-hidden />
          {filteredCount} {filteredCount === 1 ? 'student' : 'students'} in view
        </p>
        <Button type="button" variant="ghost" size="sm" className={cn('rounded-lg', focusRing)} onClick={onReset}>
          <RotateCcw className="size-3.5" aria-hidden />
          Reset filters
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1.5 md:col-span-2 lg:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Search</span>
          <span className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Name, ID, room…"
              className="h-9 rounded-xl border-[var(--nestora-sage-muted)] bg-background pl-9"
            />
          </span>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Status</span>
          <select
            value={statusFilter}
            disabled={lockStatus}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className={cn(
              'h-9 rounded-xl border border-[var(--nestora-sage-muted)] bg-background px-2.5 text-sm',
              lockStatus && 'cursor-not-allowed opacity-70',
              focusRing,
            )}
          >
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            <GraduationCap className="size-3.5" aria-hidden />
            Course
          </span>
          <select
            value={courseFilter}
            onChange={(e) => onCourseFilterChange(e.target.value)}
            className={cn('h-9 rounded-xl border border-[var(--nestora-sage-muted)] bg-background px-2.5 text-sm', focusRing)}
          >
            {(courseOptions.includes('All Courses') ? courseOptions : ['All Courses', ...courseOptions]).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Academic year</span>
          <select
            value={yearFilter}
            onChange={(e) => onYearFilterChange(e.target.value)}
            className={cn('h-9 rounded-xl border border-[var(--nestora-sage-muted)] bg-background px-2.5 text-sm', focusRing)}
          >
            {(yearOptions.includes('All Years') ? yearOptions : ['All Years', ...yearOptions]).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
      </div>
    </motion.section>
  );
}
