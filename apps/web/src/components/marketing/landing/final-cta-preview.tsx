'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

type FinalCtaPreviewProps = {
  className?: string;
};

const metrics = [
  { label: 'Beds available', value: '128' },
  { label: 'Checked in', value: '94%' },
  { label: 'Open tickets', value: '6' },
] as const;

const rows = [
  { block: 'Block A', detail: 'Occupancy reconciled', status: 'Optimal' },
  { block: 'North gate', detail: '2,140 verified movements', status: 'Live' },
  { block: 'Term fees', detail: '96.4% settlements synced', status: 'Synced' },
] as const;

const ease = [0.22, 1, 0.36, 1] as const;

export function FinalCtaPreview({ className }: FinalCtaPreviewProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.figure
      className={cn(
        'surface-final-cta-preview relative m-0 overflow-hidden rounded-2xl border border-[var(--nestora-sage-muted)] bg-[var(--nestora-white)]',
        'shadow-[0_20px_48px_-36px_color-mix(in_oklch,var(--nestora-forest)_42%,transparent)]',
        'transition-[box-shadow,border-color] duration-300',
        'hover:border-[color-mix(in_oklch,var(--nestora-sage)_45%,var(--nestora-sage-muted))]',
        'hover:shadow-[0_28px_56px_-34px_color-mix(in_oklch,var(--nestora-forest)_48%,transparent)]',
        className,
      )}
      aria-label="Nestora live campus summary preview"
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.45 }}
      transition={{ duration: 0.55, ease }}
    >
      <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-tight text-[var(--nestora-forest)] sm:text-supporting">
            Live campus grid
          </p>
          <p className="mt-0.5 truncate text-[11px] text-[var(--nestora-nav-muted)]">
            University residential complex
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--nestora-sage-muted)] bg-[var(--nestora-cream)] px-2.5 py-1 text-[10px] font-medium text-[var(--nestora-forest)]">
          <span className="relative flex size-2">
            <span className="absolute inset-0 rounded-full bg-emerald-500/40 motion-safe:animate-ping" />
            <span className="relative size-2 rounded-full bg-emerald-500" />
          </span>
          Live
        </span>
      </div>

      <div className="grid grid-cols-3 gap-px border-y border-[var(--nestora-sage-muted)] bg-[var(--nestora-sage-muted)]">
        {metrics.map((m, index) => (
          <motion.div
            key={m.label}
            className="bg-[var(--nestora-white)] px-4 py-4 sm:px-5 sm:py-5"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.06, ease }}
          >
            <p className="text-[10px] text-[var(--nestora-nav-muted)]">{m.label}</p>
            <p className="mt-1.5 text-h4 font-semibold tabular-nums tracking-tight text-[var(--nestora-forest)]">
              {m.value}
            </p>
          </motion.div>
        ))}
      </div>

      <ul className="divide-y divide-[var(--nestora-sage-muted)] px-2 py-1 sm:px-3">
        {rows.map((row, index) => (
          <motion.li
            key={row.block}
            className="group flex items-center gap-3 rounded-lg px-3 py-3 transition-colors duration-200 hover:bg-[color-mix(in_oklch,var(--nestora-cream)_55%,var(--nestora-white))] sm:px-4"
            initial={reduceMotion ? false : { opacity: 0, x: -6 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.38, delay: 0.12 + index * 0.07, ease }}
          >
            <div className="min-w-0 flex-1">
              <p className="text-caption font-medium text-[var(--nestora-ink)]">{row.block}</p>
              <p className="mt-0.5 truncate text-[11px] text-[var(--nestora-nav-muted)]">
                {row.detail}
              </p>
            </div>
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--nestora-tan)]">
              {row.status}
            </span>
            <ChevronRight
              className="size-3.5 shrink-0 text-[var(--nestora-sage)] opacity-0 transition-opacity duration-200 group-hover:opacity-100 motion-reduce:opacity-100"
              strokeWidth={2}
              aria-hidden
            />
          </motion.li>
        ))}
      </ul>

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--nestora-sage-muted)] to-transparent"
        aria-hidden
      />
    </motion.figure>
  );
}
