'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Download, FileText, List, ScrollText } from 'lucide-react';
import { useRef } from 'react';

import { AUDIT_STATS } from '@/components/dashboard/audit-logs/admin-audit-logs-data';
import { Flip, gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  onExport: () => void;
  view: 'timeline' | 'registry';
  onViewChange: (v: 'timeline' | 'registry') => void;
  flipRootRef: React.RefObject<HTMLDivElement | null>;
  apiOnline: boolean;
};

export function AdminAuditLogsPageHeader({ onExport, view, onViewChange, flipRootRef, apiOnline }: Props) {
  const reduceMotion = useReducedMotion();
  const headerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reduceMotion || !headerRef.current) return;
      gsap.from(headerRef.current.querySelectorAll('[data-aud-hero]'), {
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

  const setView = (next: 'timeline' | 'registry') => {
    if (next === view || reduceMotion || !flipRootRef.current) {
      onViewChange(next);
      return;
    }
    const state = Flip.getState(flipRootRef.current.querySelectorAll('[data-aud-flip]'));
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
        className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-[linear-gradient(90deg,transparent,color-mix(in_oklch,var(--nestora-cream)_25%,transparent))]"
        aria-hidden
      />
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr,14rem]">
        <div className="space-y-3">
          <p data-aud-hero className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
            System / Activity logs
          </p>
          <h1 data-aud-hero className="text-2xl font-semibold text-[var(--nestora-forest)]">
            Immutable audit trail
          </h1>
          <p data-aud-hero className="max-w-2xl text-sm text-muted-foreground">
            Inspect actor, action, and state transitions for compliance reviews (FR-140 – FR-144). Entries cannot be edited or deleted.
          </p>
          <div data-aud-hero className="flex flex-wrap items-center gap-2 pt-1">
            <Button type="button" onClick={onExport} className={cn('rounded-xl bg-[var(--nestora-forest)] text-white', focusRing)}>
              <Download className="size-4" aria-hidden />
              Export slice
            </Button>
            <motion.div role="group" aria-label="View mode" className="inline-flex rounded-xl border bg-[color-mix(in_oklch,var(--nestora-cream)_18%,var(--card))] p-0.5">
              {(
                [
                  ['timeline', ScrollText, 'Timeline'],
                  ['registry', List, 'Registry'],
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
        <motion.aside data-aud-hero className="rounded-xl border bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--card))] p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--nestora-sage)]">Integrity</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--nestora-forest)]">{AUDIT_STATS.entries24h}</p>
          <p className="text-xs text-muted-foreground">events last 24h</p>
          <p className="mt-2 text-[11px] text-muted-foreground">
            {apiOnline ? 'Live API' : 'Sample fallback'} · {AUDIT_STATS.retentionYears}y retention
          </p>
        </motion.aside>
      </div>
    </header>
  );
}
