'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { BarChart3, Download, LayoutGrid, Rows3 } from 'lucide-react';
import { useRef } from 'react';

import { REPORTS_STATS } from '@/components/dashboard/reports/admin-reports-data';
import { Flip, gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  onExport: () => void;
  view: 'catalog' | 'registry';
  onViewChange: (v: 'catalog' | 'registry') => void;
  flipRootRef: React.RefObject<HTMLDivElement | null>;
};

export function AdminReportsPageHeader({ onExport, view, onViewChange, flipRootRef }: Props) {
  const reduceMotion = useReducedMotion();
  const headerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reduceMotion || !headerRef.current) return;
      gsap.from(headerRef.current.querySelectorAll('[data-rpt-hero]'), {
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

  const setView = (next: 'catalog' | 'registry') => {
    if (next === view || reduceMotion || !flipRootRef.current) {
      onViewChange(next);
      return;
    }
    const state = Flip.getState(flipRootRef.current.querySelectorAll('[data-rpt-flip]'));
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
        className="pointer-events-none absolute -left-16 top-0 size-52 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--nestora-forest)_14%,transparent),transparent_70%)]"
        aria-hidden
      />
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr,14rem]">
        <div className="space-y-3">
          <p data-rpt-hero className="flex items-center gap-2 text-xs text-muted-foreground">
            <BarChart3 className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
            Insights / Reports & analytics
          </p>
          <h1 data-rpt-hero className="text-2xl font-semibold text-[var(--nestora-forest)]">
            Operations intelligence
          </h1>
          <p data-rpt-hero className="max-w-2xl text-sm text-muted-foreground">
            Run scoped hostel reports, export ledgers, and monitor KPIs. Wardens see assigned hostels only (FR-139).
          </p>
          <div data-rpt-hero className="flex flex-wrap items-center gap-2 pt-1">
            <Button type="button" onClick={onExport} className={cn('rounded-xl bg-[var(--nestora-forest)] text-white', focusRing)}>
              <Download className="size-4" aria-hidden />
              Schedule export
            </Button>
            <motion.div role="group" aria-label="View mode" className="inline-flex rounded-xl border p-0.5 bg-[color-mix(in_oklch,var(--nestora-cream)_18%,var(--card))]">
              {(
                [
                  ['catalog', LayoutGrid, 'Catalog'],
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
                    view === mode ? 'bg-card shadow-sm text-[var(--nestora-forest)]' : 'text-muted-foreground',
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
        <motion.aside data-rpt-hero className="rounded-xl border bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--card))] p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--nestora-sage)]">Pipeline health</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-[var(--nestora-forest)]">{REPORTS_STATS.avgRunSeconds}s</p>
          <p className="text-xs text-muted-foreground">avg report runtime</p>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Data {REPORTS_STATS.dataFreshnessMin}m fresh · {REPORTS_STATS.exportsThisWeek} exports this week
          </p>
        </motion.aside>
      </div>
    </header>
  );
}
