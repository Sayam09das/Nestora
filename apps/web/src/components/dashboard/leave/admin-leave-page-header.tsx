'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { CalendarRange, Download, Plane } from 'lucide-react';
import { useRef } from 'react';

import { LEAVE_STATS } from '@/components/dashboard/leave/admin-leave-data';
import { Flip, gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  onReview: () => void;
  lens: 'queue' | 'directory';
  onLensChange: (v: 'queue' | 'directory') => void;
  flipRootRef: React.RefObject<HTMLDivElement | null>;
};

export function AdminLeavePageHeader({ onReview, lens, onLensChange, flipRootRef }: Props) {
  const reduceMotion = useReducedMotion();
  const headerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reduceMotion || !headerRef.current) return;
      gsap.from(headerRef.current.querySelectorAll('[data-leave-hero]'), {
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

  const setLens = (next: 'queue' | 'directory') => {
    if (next === lens || reduceMotion || !flipRootRef.current) {
      onLensChange(next);
      return;
    }
    const state = Flip.getState(flipRootRef.current.querySelectorAll('[data-leave-flip]'));
    onLensChange(next);
    requestAnimationFrame(() => {
      Flip.from(state, { duration: 0.45, ease: 'power2.inOut', scale: true, stagger: 0.03, absolute: true });
    });
  };

  const onCampusPct = Math.round((1 - LEAVE_STATS.onLeaveNow / 420) * 100);

  return (
    <header
      ref={headerRef}
      className="relative overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] bg-card shadow-sm"
    >
      <div
        className="pointer-events-none absolute -left-16 bottom-0 size-52 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--nestora-sage)_18%,transparent),transparent_70%)]"
        aria-hidden
      />
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr,14rem]">
        <div className="space-y-3">
          <p data-leave-hero className="flex items-center gap-2 text-xs text-muted-foreground">
            <Plane className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
            Dashboard / Leave requests
          </p>
          <h1 data-leave-hero className="text-2xl font-semibold text-[var(--nestora-forest)]">
            Leave & outing desk
          </h1>
          <p data-leave-hero className="max-w-2xl text-sm text-muted-foreground">
            Approve temporary leave, retain bed allocation while residents are away, and catch late returns before
            attendance flags them (FR-038 – FR-044).
          </p>
          <div data-leave-hero className="flex flex-wrap items-center gap-2 pt-1">
            <Button type="button" onClick={onReview} className={cn('rounded-xl bg-[var(--nestora-forest)] text-white', focusRing)}>
              <CalendarRange className="size-4" aria-hidden />
              Review next
            </Button>
            <Button type="button" variant="outline" className={cn('rounded-xl', focusRing)}>
              <Download className="size-4" aria-hidden />
              Gate pass log
            </Button>
            <motion.div
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
            </motion.div>
          </div>
        </div>
        <motion.aside
          data-leave-hero
          initial={reduceMotion ? false : { opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--card))] p-4"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--nestora-sage)]">On campus now</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-[var(--nestora-forest)]">{onCampusPct}%</p>
          <p className="text-xs text-muted-foreground">{LEAVE_STATS.onLeaveNow} residents on approved leave</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e7e7dc]">
            <div className="h-full rounded-full bg-[#6d9773]" style={{ width: `${onCampusPct}%` }} />
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">{LEAVE_STATS.pendingReview} awaiting warden review</p>
        </motion.aside>
      </div>
    </header>
  );
}
