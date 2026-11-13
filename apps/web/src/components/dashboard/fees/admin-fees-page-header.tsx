'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { CircleDollarSign, LayoutGrid, Receipt, Rows3 } from 'lucide-react';
import { useMemo, useRef } from 'react';

import { formatInr } from '@/components/dashboard/fees/admin-fees-data';
import type { FinanceDeskSummary } from '@/lib/api/finance';
import { Flip, gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  onRecordPayment: () => void;
  view: 'desk' | 'registry';
  onViewChange: (v: 'desk' | 'registry') => void;
  flipRootRef: React.RefObject<HTMLDivElement | null>;
  summary: FinanceDeskSummary | null;
  loading?: boolean;
};

export function AdminFeesPageHeader({
  onRecordPayment,
  view,
  onViewChange,
  flipRootRef,
  summary,
  loading = false,
}: Props) {
  const reduceMotion = useReducedMotion();
  const headerRef = useRef<HTMLElement>(null);

  const liveLabel = useMemo(() => {
    if (!summary?.generatedAt || loading) return null;
    return new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' }).format(
      new Date(summary.generatedAt),
    );
  }, [summary?.generatedAt, loading]);

  useGSAP(
    () => {
      if (reduceMotion || !headerRef.current) return;
      gsap.from(headerRef.current.querySelectorAll('[data-fee-hero]'), {
        opacity: 0,
        y: 12,
        stagger: 0.07,
        duration: 0.45,
        ease: 'back.out(1.15)',
        clearProps: 'opacity,transform',
      });
    },
    { scope: headerRef, dependencies: [reduceMotion] },
  );

  const setView = (next: 'desk' | 'registry') => {
    if (next === view || reduceMotion || !flipRootRef.current) {
      onViewChange(next);
      return;
    }
    const state = Flip.getState(flipRootRef.current.querySelectorAll('[data-fee-flip]'));
    onViewChange(next);
    requestAnimationFrame(() => {
      Flip.from(state, { duration: 0.45, ease: 'power2.inOut', scale: true, stagger: 0.03, absolute: true });
    });
  };

  return (
    <header
      ref={headerRef}
      className="relative overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] bg-card shadow-sm"
    >
      <div
        className="pointer-events-none absolute -right-16 top-0 size-56 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--nestora-sage)_18%,transparent),transparent_68%)]"
        aria-hidden
      />
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr,15rem]">
        <div className="space-y-3">
          <p data-fee-hero className="flex items-center gap-2 text-xs text-muted-foreground">
            <CircleDollarSign className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
            Operations / Fees & payments
            {liveLabel ? (
              <span className="rounded-full border border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--nestora-forest)]">
                Live · {liveLabel}
              </span>
            ) : null}
          </p>
          <h1 data-fee-hero className="text-2xl font-semibold text-[var(--nestora-forest)]">
            Finance desk
          </h1>
          <p data-fee-hero className="max-w-2xl text-sm text-muted-foreground">
            Hostel fee schedules, student ledgers, offline receipts, and waiver approvals — aligned to FR-074–FR-083.
          </p>
          <div data-fee-hero className="flex flex-wrap items-center gap-2 pt-1">
            <Button type="button" onClick={onRecordPayment} className={cn('rounded-xl bg-[var(--nestora-forest)] text-white', focusRing)}>
              <Receipt className="size-4" aria-hidden />
              Record payment
            </Button>
            <motion.div role="group" aria-label="View mode" className="inline-flex rounded-xl border bg-[color-mix(in_oklch,var(--nestora-cream)_18%,var(--card))] p-0.5">
              {(
                [
                  ['desk', LayoutGrid, 'Ledger desk'],
                  ['registry', Rows3, 'Registry'],
                ] as const
              ).map(([mode, Icon, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setView(mode)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium',
                    focusRing,
                    view === mode ? 'bg-card text-[var(--nestora-forest)] shadow-sm' : 'text-muted-foreground',
                  )}
                  aria-pressed={view === mode}
                >
                  <Icon className="size-3.5" aria-hidden />
                  {label}
                </button>
              ))}
            </motion.div>
          </div>
        </div>
        <motion.aside data-fee-hero className="rounded-xl border bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--card))] p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--nestora-sage)]">Outstanding</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--nestora-forest)]">
            {loading && !summary ? '…' : formatInr(summary?.outstandingTotal ?? 0)}
          </p>
          <p className="text-xs text-muted-foreground">across active semesters</p>
          <p className="mt-2 text-[11px] text-muted-foreground">
            {summary?.pendingApprovals ?? (loading ? '…' : 0)} pending approvals ·{' '}
            {summary?.remindersQueued ?? (loading ? '…' : 0)} reminders queued
          </p>
        </motion.aside>
      </div>
    </header>
  );
}
