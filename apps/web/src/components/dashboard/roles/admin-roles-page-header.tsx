'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { LayoutGrid, Rows3, Shield, UserPlus } from 'lucide-react';
import { useMemo, useRef } from 'react';

import type { RolesDeskSummary } from '@/lib/api/roles-desk';
import { liveMetricNumber } from '@/lib/api/live-metric';
import { Flip, gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  onGrant: () => void;
  view: 'hub' | 'registry';
  onViewChange: (v: 'hub' | 'registry') => void;
  flipRootRef: React.RefObject<HTMLDivElement | null>;
  summary?: RolesDeskSummary | null;
  loading?: boolean;
};

export function AdminRolesPageHeader({ onGrant, view, onViewChange, flipRootRef, summary, loading }: Props) {
  const reduceMotion = useReducedMotion();
  const headerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reduceMotion || !headerRef.current) return;
      gsap.from(headerRef.current.querySelectorAll('[data-role-hero]'), {
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

  const modules = liveMetricNumber(summary?.matrixModules, loading);
  const pendingReviews = liveMetricNumber(summary?.pendingReviews, loading);
  const customGrants = liveMetricNumber(summary?.customGrants, loading);

  const liveStamp = useMemo(() => {
    if (!summary?.generatedAt) return null;
    return new Intl.DateTimeFormat('en-IN', { timeStyle: 'short' }).format(new Date(summary.generatedAt));
  }, [summary?.generatedAt]);

  const setView = (next: 'hub' | 'registry') => {
    if (next === view || reduceMotion || !flipRootRef.current) {
      onViewChange(next);
      return;
    }
    const state = Flip.getState(flipRootRef.current.querySelectorAll('[data-role-flip]'));
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
        className="pointer-events-none absolute -left-20 bottom-0 size-60 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--nestora-gold)_12%,transparent),transparent_70%)]"
        aria-hidden
      />
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr,14rem]">
        <div className="space-y-3">
          <p data-role-hero className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Shield className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
            System / Roles & permissions
            {liveStamp ? (
              <span className="rounded-full border border-[color-mix(in_oklch,var(--nestora-sage)_30%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage)_8%,var(--card))] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--nestora-sage)]">
                Live · {liveStamp}
              </span>
            ) : null}
          </p>
          <h1 data-role-hero className="text-2xl font-semibold text-[var(--nestora-forest)]">
            Access architecture
          </h1>
          <p data-role-hero className="max-w-2xl text-sm text-muted-foreground">
            Six institutional roles with scoped capabilities. Provision accounts, review matrices, and enforce hostel isolation (FR-139).
          </p>
          <div data-role-hero className="flex flex-wrap items-center gap-2 pt-1">
            <Button type="button" onClick={onGrant} className={cn('rounded-xl bg-[var(--nestora-forest)] text-white', focusRing)}>
              <UserPlus className="size-4" aria-hidden />
              Grant role
            </Button>
            <motion.div role="group" aria-label="View mode" className="inline-flex rounded-xl border bg-[color-mix(in_oklch,var(--nestora-cream)_18%,var(--card))] p-0.5">
              {(
                [
                  ['hub', LayoutGrid, 'Matrix hub'],
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
        <motion.aside data-role-hero className="rounded-xl border bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--card))] p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--nestora-sage)]">Coverage</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-[var(--nestora-forest)]">{modules ?? '—'}</p>
          <p className="text-xs text-muted-foreground">modules in policy matrix</p>
          <p className="mt-2 text-[11px] text-muted-foreground">
            {pendingReviews ?? '—'} pending reviews · {customGrants ?? '—'} custom grants
          </p>
        </motion.aside>
      </div>
    </header>
  );
}
