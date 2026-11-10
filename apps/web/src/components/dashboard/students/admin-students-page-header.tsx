'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Download, FileSpreadsheet, Plus, Users } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useRef } from 'react';

import type { StudentDirectorySummary } from '@/lib/api/students';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

const BAR_GREEN = '#6d9773';
const BAR_YELLOW = '#ffba00';
const BAR_TRACK = '#e7e7dc';

type AdminStudentsPageHeaderProps = {
  summary: StudentDirectorySummary | null;
  loading?: boolean;
};

export function AdminStudentsPageHeader({ summary, loading = false }: AdminStudentsPageHeaderProps) {
  const reduceMotion = useReducedMotion();
  const headerRef = useRef<HTMLElement>(null);

  const { activeRate, activeWidthPct, pendingWidthPct, total, active, pending } = useMemo(() => {
    const totalCount = summary?.total ?? 0;
    const activeCount = summary?.active ?? 0;
    const pendingCount = summary?.pending ?? 0;
    const activePct = totalCount > 0 ? (activeCount / totalCount) * 100 : 0;
    const pendingPct = totalCount > 0 ? (pendingCount / totalCount) * 100 : 0;
    return {
      activeRate: summary?.activeRatePercent ?? (totalCount > 0 ? Math.round(activePct * 10) / 10 : 0),
      activeWidthPct: activePct,
      pendingWidthPct: pendingPct,
      total: totalCount,
      active: activeCount,
      pending: pendingCount,
    };
  }, [summary]);

  useGSAP(
    () => {
      if (reduceMotion || !headerRef.current) {
        return;
      }
      gsap.from(headerRef.current.querySelectorAll('[data-students-hero]'), {
        opacity: 0,
        y: 12,
        duration: 0.45,
        stagger: 0.07,
        ease: 'back.out(1.15)',
        clearProps: 'opacity,transform',
      });
      gsap.from(headerRef.current.querySelectorAll('[data-students-hero-bar]'), {
        scaleX: 0,
        duration: 0.75,
        stagger: 0.08,
        ease: 'power3.out',
        delay: 0.15,
        transformOrigin: 'left center',
        clearProps: 'transform',
      });
    },
    { scope: headerRef, dependencies: [reduceMotion] },
  );

  return (
    <header
      ref={headerRef}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))]',
        'bg-card shadow-[0_1px_0_0_color-mix(in_oklch,var(--nestora-sage-muted)_45%,transparent),0_16px_40px_-32px_color-mix(in_srgb,var(--nestora-forest)_28%,transparent)]',
      )}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 flex w-1 flex-col overflow-hidden rounded-l-2xl" aria-hidden>
        <span className="min-h-0 flex-[7] bg-[#6d9773]" />
        <span className="min-h-0 flex-[3] bg-[#ffba00]" />
      </div>
      <div
        className="pointer-events-none absolute -right-12 -top-16 size-48 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--nestora-sage)_22%,transparent),transparent_70%)]"
        aria-hidden
      />

      <div className="relative flex flex-col gap-4 p-4 pl-5 sm:flex-row sm:items-center sm:justify-between sm:p-5 sm:pl-6">
        <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
          <motion.span
            data-students-hero
            className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[var(--nestora-sage-muted)] bg-[color-mix(in_oklch,var(--nestora-sage-light)_55%,var(--card))] text-[var(--nestora-forest)] shadow-sm"
            whileHover={reduceMotion ? undefined : { scale: 1.04, rotate: -2 }}
            transition={{ type: 'spring', stiffness: 520, damping: 26 }}
          >
            <Users className="size-5" aria-hidden />
          </motion.span>

          <div className="min-w-0" data-students-hero>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--nestora-sage)]">Students</p>
              <span className="inline-flex items-center rounded-full border border-[color-mix(in_oklch,var(--nestora-sage)_30%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage-light)_40%,var(--card))] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--nestora-forest)]">
                Active page
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--nestora-forest)] sm:text-[1.65rem]">
              All Students
            </h1>
            <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
              <span className="font-semibold tabular-nums text-foreground">
                {loading && !summary ? '—' : total.toLocaleString('en-IN')}
              </span>{' '}
              records ·{' '}
              <span className="font-medium text-[var(--nestora-forest)]">
                {summary || !loading ? `${activeRate}%` : '—'}
              </span>{' '}
              active enrollment
            </p>
            <ul className="mt-3 flex flex-wrap gap-2" aria-label="Quick counts">
              <li
                data-students-hero
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--nestora-sage-muted)] bg-[color-mix(in_oklch,var(--nestora-sage-light)_35%,var(--card))] px-2.5 py-1 text-[11px] font-semibold text-[var(--nestora-forest)]"
              >
                <span className="size-1.5 rounded-full bg-[var(--nestora-sage)]" aria-hidden />
                {summary == null && loading ? '…' : active} active
              </li>
              <li
                data-students-hero
                className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_oklch,var(--nestora-gold)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_12%,var(--card))] px-2.5 py-1 text-[11px] font-semibold text-[var(--nestora-forest)]"
              >
                <span className="size-1.5 rounded-full bg-[var(--nestora-gold)]" aria-hidden />
                {summary == null && loading ? '…' : pending} pending
              </li>
            </ul>
          </div>
        </div>

        <div data-students-hero className="flex w-full shrink-0 flex-wrap gap-2 sm:w-auto sm:justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                'inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[var(--nestora-sage-muted)] bg-[color-mix(in_oklch,var(--nestora-cream)_25%,var(--card))] px-3 text-sm font-semibold text-[var(--nestora-forest)]',
                'transition-colors hover:bg-[color-mix(in_oklch,var(--nestora-sage-light)_45%,var(--card))]',
                focusRing,
              )}
            >
              <Download className="size-4" aria-hidden />
              Export
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem>
                <Download className="size-4" aria-hidden />
                Download CSV
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileSpreadsheet className="size-4" aria-hidden />
                Download Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <motion.div whileTap={reduceMotion ? undefined : { scale: 0.97 }} transition={{ type: 'spring', stiffness: 520, damping: 28 }}>
            <Button
              nativeButton={false}
              render={<Link href="/admin/students/new" className={focusRing} />}
              className="h-9 rounded-xl bg-[var(--nestora-forest)] px-4 text-sm font-semibold text-white shadow-sm hover:brightness-110"
            >
              <Plus className="size-4" aria-hidden />
              Add Student
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="relative border-t border-[var(--nestora-sage-muted)]/60 px-5 py-2.5 pl-6 sm:pl-7">
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          <span>Directory fill</span>
          <span className="flex items-center gap-3 normal-case tracking-normal">
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full" style={{ backgroundColor: BAR_GREEN }} aria-hidden />
              Active
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full" style={{ backgroundColor: BAR_YELLOW }} aria-hidden />
              Pending
            </span>
          </span>
        </div>
        <div
          className="flex h-2 overflow-hidden rounded-full"
          style={{ backgroundColor: BAR_TRACK }}
          role="img"
          aria-label={`Directory: ${activeRate}% active, ${Math.round(pendingWidthPct * 10) / 10}% pending`}
        >
          <div
            data-students-hero-bar
            className="h-full shrink-0 origin-left"
            style={{ width: `${activeWidthPct}%`, backgroundColor: BAR_GREEN }}
          />
          <div
            data-students-hero-bar
            className="h-full shrink-0 origin-left"
            style={{ width: `${pendingWidthPct}%`, backgroundColor: BAR_YELLOW }}
          />
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          <span className="font-semibold tabular-nums text-[var(--nestora-forest)]">{activeRate}%</span> active · live
          Nestora directory
          {summary?.generatedAt ? (
            <span className="text-muted-foreground"> · refreshes each minute</span>
          ) : null}
        </p>
      </div>
    </header>
  );
}
