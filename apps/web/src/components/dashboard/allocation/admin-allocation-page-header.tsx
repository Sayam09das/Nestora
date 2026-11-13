'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Download, LayoutGrid, Plus } from 'lucide-react';
import { useMemo, useRef } from 'react';

import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import type { AllocationDirectorySummary } from '@/lib/api/allocations';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type AdminAllocationPageHeaderProps = {
  onAllocate: () => void;
  summary: AllocationDirectorySummary | null;
  loading?: boolean;
};

export function AdminAllocationPageHeader({
  onAllocate,
  summary,
  loading = false,
}: AdminAllocationPageHeaderProps) {
  const reduceMotion = useReducedMotion();
  const headerRef = useRef<HTMLElement>(null);

  const { bedsAvailable, pendingQueue, fillPct, liveLabel } = useMemo(() => {
    const beds = summary?.bedsAvailable ?? 0;
    const total = summary?.totalBedCapacity ?? 0;
    const share = summary?.bedsAvailableSharePct ?? (total > 0 ? (beds / total) * 100 : 0);
    const liveLabel =
      summary?.generatedAt && !loading
        ? new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' }).format(
            new Date(summary.generatedAt),
          )
        : null;
    return {
      bedsAvailable: beds,
      pendingQueue: summary?.pendingQueue ?? 0,
      fillPct: Math.round(share),
      liveLabel,
    };
  }, [summary, loading]);

  useGSAP(
    () => {
      if (reduceMotion || !headerRef.current) return;
      gsap.from(headerRef.current.querySelectorAll('[data-alloc-hero]'), {
        opacity: 0,
        y: 12,
        stagger: 0.07,
        duration: 0.45,
        ease: 'back.out(1.15)',
        clearProps: 'opacity,transform',
      });
      gsap.from(headerRef.current.querySelectorAll('[data-alloc-hero-bar]'), {
        scaleX: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.12,
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
        'relative overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] bg-card shadow-sm',
      )}
    >
      <div className="pointer-events-none absolute -left-20 top-0 size-56 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--nestora-gold)_15%,transparent),transparent_70%)]" aria-hidden />
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr,14rem]">
        <div className="space-y-3">
          <p data-alloc-hero className="flex items-center gap-2 text-xs text-muted-foreground">
            <LayoutGrid className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
            Dashboard / Room Allocation
          </p>
          <h1 data-alloc-hero className="text-2xl font-semibold text-[var(--nestora-forest)]">
            Room Allocation
          </h1>
          <p data-alloc-hero className="max-w-2xl text-sm text-muted-foreground">
            Assign fully approved students to individual beds, review room-change requests, and prevent duplicate
            allocations. One bed holds at most one active resident (BR-002).
            {liveLabel ? (
              <>
                {' '}
                · <span className="font-medium text-[var(--nestora-sage)]">Live {liveLabel}</span>
              </>
            ) : null}
          </p>
          <div data-alloc-hero className="flex flex-wrap gap-2 pt-1">
            <Button type="button" onClick={onAllocate} className={cn('rounded-xl bg-[var(--nestora-forest)] text-white', focusRing)}>
              <Plus className="size-4" aria-hidden />
              New allocation
            </Button>
            <Button type="button" variant="outline" className={cn('rounded-xl', focusRing)}>
              <Download className="size-4" aria-hidden />
              Export log
            </Button>
          </div>
        </div>
        <motion.aside
          data-alloc-hero
          initial={reduceMotion ? false : { opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--card))] p-4"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--nestora-sage)]">Live capacity</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-[var(--nestora-forest)]">
            {loading ? '—' : bedsAvailable.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-muted-foreground">beds ready now</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e7e7dc]">
            <div
              data-alloc-hero-bar
              className="h-full rounded-full bg-[#6d9773]"
              style={{ width: loading ? '0%' : `${fillPct}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            {loading ? '—' : pendingQueue} in queue
          </p>
        </motion.aside>
      </div>
    </header>
  );
}
