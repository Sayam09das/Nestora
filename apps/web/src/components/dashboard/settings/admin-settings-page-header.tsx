'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { LayoutGrid, Rows3, Save, Settings2 } from 'lucide-react';
import { useMemo, useRef } from 'react';

import type { SettingsDeskSummary } from '@/lib/api/settings';
import { liveMetricNumber, liveMetricText } from '@/lib/api/live-metric';
import { Flip, gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  onReviewSave: () => void;
  view: 'hub' | 'registry';
  onViewChange: (v: 'hub' | 'registry') => void;
  flipRootRef: React.RefObject<HTMLDivElement | null>;
  summary?: SettingsDeskSummary | null;
  loading?: boolean;
};

export function AdminSettingsPageHeader({ onReviewSave, view, onViewChange, flipRootRef, summary, loading }: Props) {
  const reduceMotion = useReducedMotion();
  const headerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reduceMotion || !headerRef.current) return;
      gsap.from(headerRef.current.querySelectorAll('[data-set-hero]'), {
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

  const environment = liveMetricText(summary?.environment, loading, '—');
  const lastPublishHours = liveMetricNumber(summary?.lastPublishHours, loading);
  const pendingDrafts = liveMetricNumber(summary?.pendingDrafts, loading);
  const criticalLocks = liveMetricNumber(summary?.criticalLocks, loading);

  const liveStamp = useMemo(() => {
    if (!summary?.generatedAt) return null;
    return new Intl.DateTimeFormat('en-IN', { timeStyle: 'short' }).format(new Date(summary.generatedAt));
  }, [summary?.generatedAt]);

  const setView = (next: 'hub' | 'registry') => {
    if (next === view || reduceMotion || !flipRootRef.current) {
      onViewChange(next);
      return;
    }
    const state = Flip.getState(flipRootRef.current.querySelectorAll('[data-set-flip]'));
    onViewChange(next);
    requestAnimationFrame(() => {
      Flip.from(state, { duration: 0.45, ease: 'power2.inOut', scale: true, stagger: 0.03, absolute: true });
    });
  };

  return (
    <header
      ref={headerRef}
      className="relative overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] bg-card shadow-sm backdrop-blur-sm"
    >
      <div
        className="pointer-events-none absolute -right-12 top-0 size-56 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--nestora-sage)_16%,transparent),transparent_68%)]"
        aria-hidden
      />
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr,14rem]">
        <div className="space-y-3">
          <p data-set-hero className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Settings2 className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
            System / Settings console
            {liveStamp ? (
              <span className="rounded-full border border-[color-mix(in_oklch,var(--nestora-sage)_30%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage)_8%,var(--card))] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--nestora-sage)]">
                Live · {liveStamp}
              </span>
            ) : null}
          </p>
          <h1 data-set-hero className="text-2xl font-semibold text-[var(--nestora-forest)]">
            Control center
          </h1>
          <p data-set-hero className="max-w-2xl text-sm text-muted-foreground">
            Tune institution parameters, operational thresholds, and notification policy. Critical safety channels stay locked (FR-121).
          </p>
          <div data-set-hero className="flex flex-wrap items-center gap-2 pt-1">
            <Button type="button" onClick={onReviewSave} className={cn('rounded-xl bg-[var(--nestora-forest)] text-white', focusRing)}>
              <Save className="size-4" aria-hidden />
              Review & publish
            </Button>
            <motion.div role="group" aria-label="View mode" className="inline-flex rounded-xl border bg-[color-mix(in_oklch,var(--nestora-cream)_18%,var(--card))] p-0.5">
              {(
                [
                  ['hub', LayoutGrid, 'Hub'],
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
        <motion.aside data-set-hero className="rounded-xl border bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--card))] p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--nestora-sage)]">Environment</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--nestora-forest)]">{environment}</p>
          <p className="text-xs text-muted-foreground">Last publish {lastPublishHours ?? '—'}h ago</p>
          <p className="mt-2 text-[11px] text-muted-foreground">
            {pendingDrafts ?? '—'} drafts · {criticalLocks ?? '—'} locked controls
          </p>
        </motion.aside>
      </div>
    </header>
  );
}
