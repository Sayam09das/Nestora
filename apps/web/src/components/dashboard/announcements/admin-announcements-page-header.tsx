'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Download, LayoutGrid, Megaphone, Rows3 } from 'lucide-react';
import { useRef } from 'react';

import { ANNOUNCEMENT_STATS } from '@/components/dashboard/announcements/admin-announcements-data';
import { Flip, gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  onCompose: () => void;
  view: 'feed' | 'registry';
  onViewChange: (v: 'feed' | 'registry') => void;
  flipRootRef: React.RefObject<HTMLDivElement | null>;
};

export function AdminAnnouncementsPageHeader({ onCompose, view, onViewChange, flipRootRef }: Props) {
  const reduceMotion = useReducedMotion();
  const headerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reduceMotion || !headerRef.current) return;
      gsap.from(headerRef.current.querySelectorAll('[data-ann-hero]'), {
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

  const setView = (next: 'feed' | 'registry') => {
    if (next === view || reduceMotion || !flipRootRef.current) {
      onViewChange(next);
      return;
    }
    const state = Flip.getState(flipRootRef.current.querySelectorAll('[data-ann-flip]'));
    onViewChange(next);
    requestAnimationFrame(() => {
      Flip.from(state, { duration: 0.45, ease: 'power2.inOut', scale: true, stagger: 0.03, absolute: true });
    });
  };

  return (
    <header
      ref={headerRef}
      className="relative overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-gold)_22%,var(--border))] bg-card shadow-sm"
    >
      <div
        className="pointer-events-none absolute -right-20 top-0 size-56 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--nestora-gold)_18%,transparent),transparent_70%)]"
        aria-hidden
      />
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr,14rem]">
        <div className="space-y-3">
          <p data-ann-hero className="flex items-center gap-2 text-xs text-muted-foreground">
            <Megaphone className="size-3.5 text-[var(--nestora-tan)]" aria-hidden />
            Dashboard / Notices & announcements
          </p>
          <h1 data-ann-hero className="text-2xl font-semibold text-[var(--nestora-forest)]">
            Announcement studio
          </h1>
          <p data-ann-hero className="max-w-2xl text-sm text-muted-foreground">
            Publish scoped circulars, attach PDFs, and track mandatory acknowledgements across hostels (FR-084 – FR-089).
          </p>
          <div data-ann-hero className="flex flex-wrap items-center gap-2 pt-1">
            <Button type="button" onClick={onCompose} className={cn('rounded-xl bg-[var(--nestora-forest)] text-white', focusRing)}>
              <Megaphone className="size-4" aria-hidden />
              New announcement
            </Button>
            <Button type="button" variant="outline" className={cn('rounded-xl', focusRing)}>
              <Download className="size-4" aria-hidden />
              Export ack report
            </Button>
            <motion.div
              role="group"
              aria-label="View mode"
              className="inline-flex rounded-xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-cream)_18%,var(--card))] p-0.5"
            >
              {(
                [
                  ['feed', LayoutGrid, 'Feed'],
                  ['registry', Rows3, 'Registry'],
                ] as const
              ).map(([mode, Icon, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setView(mode)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                    focusRing,
                    view === mode ? 'bg-card text-[var(--nestora-forest)] shadow-sm' : 'text-muted-foreground hover:text-foreground',
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
        <motion.aside
          data-ann-hero
          initial={reduceMotion ? false : { opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-xl border border-[color-mix(in_oklch,var(--nestora-gold)_25%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_10%,var(--card))] p-4"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--nestora-sage)]">Engagement</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-[var(--nestora-forest)]">{ANNOUNCEMENT_STATS.avgReadRate}%</p>
          <p className="text-xs text-muted-foreground">avg acknowledgement (sample)</p>
          <p className="mt-3 text-[11px] text-muted-foreground">
            {ANNOUNCEMENT_STATS.liveNow} live · {ANNOUNCEMENT_STATS.ackPending} acks pending
          </p>
        </motion.aside>
      </div>
    </header>
  );
}
