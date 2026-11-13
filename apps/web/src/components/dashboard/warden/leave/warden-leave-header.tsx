'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Building2, CalendarRange, Download, Plane } from 'lucide-react';
import { useMemo, useRef } from 'react';

import { Flip, gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import type { LeaveDeskSummary } from '@/lib/api/leaves';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatRelativeTimeFromIso } from '@/lib/format-relative-time';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  hostelName: string;
  onReview: () => void;
  onGatePassLog: () => void;
  lens: 'queue' | 'directory';
  onLensChange: (v: 'queue' | 'directory') => void;
  flipRootRef: React.RefObject<HTMLDivElement | null>;
  summary: LeaveDeskSummary | null;
  loading?: boolean;
};

export function WardenLeaveHeader({
  hostelName,
  onReview,
  onGatePassLog,
  lens,
  onLensChange,
  flipRootRef,
  summary,
  loading = false,
}: Props) {
  const reduceMotion = useReducedMotion();
  const headerRef = useRef<HTMLElement>(null);

  const setLens = (next: 'queue' | 'directory') => {
    if (next === lens) return;
    if (reduceMotion || !flipRootRef.current) {
      onLensChange(next);
      return;
    }
    const targets = flipRootRef.current.querySelectorAll('[data-leave-flip]');
    if (targets.length < 2) {
      onLensChange(next);
      return;
    }
    const state = Flip.getState(targets);
    onLensChange(next);
    requestAnimationFrame(() => {
      Flip.from(state, {
        duration: 0.45,
        ease: 'power2.inOut',
        scale: true,
        stagger: 0.03,
        absolute: true,
        onComplete: () => {
          gsap.set(targets, { clearProps: 'all' });
        },
      });
    });
  };

  const onCampusPct = summary?.onCampusPercent ?? (loading ? null : 100);
  const onLeaveNow = summary?.onLeaveNow ?? 0;
  const pendingReview = summary?.pendingReview ?? 0;
  const liveLabel = useMemo(() => {
    if (!summary?.generatedAt) return null;
    return formatRelativeTimeFromIso(summary.generatedAt);
  }, [summary?.generatedAt]);

  useGSAP(
    () => {
      if (reduceMotion || !headerRef.current) return;
      gsap.from(headerRef.current.querySelectorAll('[data-warden-leave-hero]'), {
        opacity: 0,
        y: 12,
        stagger: 0.06,
        duration: 0.42,
        clearProps: 'opacity,transform',
      });
    },
    { scope: headerRef, dependencies: [reduceMotion] },
  );

  return (
    <header
      ref={headerRef}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))]',
        'bg-[linear-gradient(135deg,color-mix(in_oklch,var(--nestora-cream)_48%,var(--card))_0%,var(--card)_62%)] shadow-sm',
      )}
    >
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr,14rem]">
        <div className="space-y-3">
          <p data-warden-leave-hero className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--nestora-sage)]">
            <Plane className="size-3.5" aria-hidden />
            Leave & outings · MOD-08
            {liveLabel ? (
              <span className="rounded-full border border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] px-2 py-0.5 text-[10px] font-semibold normal-case tracking-normal text-[var(--nestora-forest)]">
                Synced {liveLabel}
              </span>
            ) : null}
          </p>
          <h1 data-warden-leave-hero className="text-2xl font-semibold text-[var(--nestora-forest)]">
            Leave requests
          </h1>
          <p data-warden-leave-hero className="max-w-2xl text-sm text-muted-foreground">
            Approve or reject leave for your hostel residents, issue gate passes, and track returns before attendance
            flags (FR-038–FR-044).
          </p>
          <motion.div
            data-warden-leave-hero
            className="flex flex-wrap items-center gap-2 pt-1"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.06, duration: 0.35 }}
          >
            <Badge
              variant="outline"
              className="gap-1.5 border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] bg-card font-semibold text-[var(--nestora-forest)]"
            >
              <Building2 className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
              {hostelName}
            </Badge>
            <Button type="button" onClick={onReview} className={cn('rounded-xl bg-[var(--nestora-forest)] text-white', focusRing)}>
              <CalendarRange className="size-4" aria-hidden />
              Review next
            </Button>
            <Button type="button" variant="outline" onClick={onGatePassLog} className={cn('rounded-xl', focusRing)}>
              <Download className="size-4" aria-hidden />
              Gate pass log
            </Button>
            <div
              role="group"
              aria-label="Workspace lens"
              className="inline-flex rounded-xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-cream)_18%,var(--card))] p-0.5"
            >
              {(['queue', 'directory'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setLens(mode)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                    focusRing,
                    lens === mode ? 'bg-card text-[var(--nestora-forest)] shadow-sm' : 'text-muted-foreground hover:text-foreground',
                  )}
                  aria-pressed={lens === mode}
                >
                  {mode === 'queue' ? 'Warden queue' : 'Full registry'}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
        <motion.aside
          data-warden-leave-hero
          initial={reduceMotion ? false : { opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--card))] p-4"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--nestora-sage)]">On campus now</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-[var(--nestora-forest)]">
            {onCampusPct == null ? '…' : `${onCampusPct}%`}
          </p>
          <p className="text-xs text-muted-foreground">{onLeaveNow} residents on approved leave</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e7e7dc]">
            <div
              className="h-full rounded-full bg-[#6d9773] transition-[width] duration-500"
              style={{ width: `${onCampusPct ?? 0}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">{pendingReview} awaiting your review</p>
        </motion.aside>
      </div>
    </header>
  );
}
