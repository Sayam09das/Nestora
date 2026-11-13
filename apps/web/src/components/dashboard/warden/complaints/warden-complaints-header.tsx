'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Building2, Download, Kanban, MessageSquareWarning, UserPlus } from 'lucide-react';
import { useMemo, useRef } from 'react';

import type { ComplaintsDeskSummary } from '@/lib/api/complaints';
import { Flip, gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatRelativeTimeFromIso } from '@/lib/format-relative-time';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  hostelName: string;
  onAssign: () => void;
  view: 'board' | 'list';
  onViewChange: (v: 'board' | 'list') => void;
  boardRef: React.RefObject<HTMLDivElement | null>;
  summary: ComplaintsDeskSummary | null;
  loading?: boolean;
};

export function WardenComplaintsHeader({
  hostelName,
  onAssign,
  view,
  onViewChange,
  boardRef,
  summary,
  loading = false,
}: Props) {
  const reduceMotion = useReducedMotion();
  const headerRef = useRef<HTMLElement>(null);

  const toggleView = (next: 'board' | 'list') => {
    if (next === view || reduceMotion || !boardRef.current) {
      onViewChange(next);
      return;
    }
    const state = Flip.getState(boardRef.current.querySelectorAll('[data-cmp-flip]'));
    onViewChange(next);
    requestAnimationFrame(() => {
      Flip.from(state, {
        duration: 0.45,
        ease: 'power2.inOut',
        scale: true,
        stagger: 0.03,
        absolute: true,
      });
    });
  };

  const avgHours = summary?.avgTurnaroundHours ?? 0;
  const slaPct = Math.min(100, Math.round((avgHours / 48) * 100));
  const liveLabel = useMemo(() => {
    if (!summary?.generatedAt || loading) return null;
    return formatRelativeTimeFromIso(summary.generatedAt);
  }, [summary?.generatedAt, loading]);

  useGSAP(
    () => {
      if (reduceMotion || !headerRef.current) return;
      gsap.from(headerRef.current.querySelectorAll('[data-warden-cmp-hero]'), {
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
      <div
        className="pointer-events-none absolute -right-20 -top-12 size-52 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,#dc2626_10%,transparent),transparent_68%)]"
        aria-hidden
      />
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr,14rem]">
        <div className="space-y-3">
          <p
            data-warden-cmp-hero
            className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--nestora-sage)]"
          >
            <MessageSquareWarning className="size-3.5" aria-hidden />
            Complaints & maintenance · MOD-09
            {liveLabel ? (
              <span className="rounded-full border border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] px-2 py-0.5 text-[10px] font-semibold normal-case tracking-normal text-[var(--nestora-forest)]">
                Synced {liveLabel}
              </span>
            ) : null}
          </p>
          <h1 data-warden-cmp-hero className="text-2xl font-semibold text-[var(--nestora-forest)]">
            Complaints & issues
          </h1>
          <p data-warden-cmp-hero className="max-w-2xl text-sm text-muted-foreground">
            Triage hostel maintenance tickets, assign staff, and stay ahead of SLA deadlines for your residents (FR-065 –
            FR-073).
          </p>
          <motion.div
            data-warden-cmp-hero
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
            <Button type="button" onClick={onAssign} className={cn('rounded-xl bg-[var(--nestora-forest)] text-white', focusRing)}>
              <UserPlus className="size-4" aria-hidden />
              Assign ticket
            </Button>
            <Button type="button" variant="outline" className={cn('rounded-xl', focusRing)}>
              <Download className="size-4" aria-hidden />
              Export SLA
            </Button>
            <div
              role="group"
              aria-label="View mode"
              className="inline-flex rounded-xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-cream)_18%,var(--card))] p-0.5"
            >
              {(['board', 'list'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => toggleView(mode)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                    focusRing,
                    view === mode
                      ? 'bg-card text-[var(--nestora-forest)] shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                  aria-pressed={view === mode}
                >
                  {mode === 'board' ? <Kanban className="size-3.5" aria-hidden /> : null}
                  {mode === 'board' ? 'Board' : 'Registry'}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
        <motion.aside
          data-warden-cmp-hero
          initial={reduceMotion ? false : { opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--card))] p-4"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--nestora-sage)]">Resolution pulse</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-[var(--nestora-forest)]">
            {loading && !summary ? '…' : `${avgHours}h`}
          </p>
          <p className="text-xs text-muted-foreground">avg turnaround (7-day)</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e7e7dc]">
            <div className="h-full rounded-full bg-[#6d9773]" style={{ width: `${100 - slaPct}%` }} />
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            {summary?.openTickets ?? (loading ? '…' : 0)} open · {summary?.slaAtRisk ?? (loading ? '…' : 0)} at SLA risk
          </p>
        </motion.aside>
      </div>
    </header>
  );
}
