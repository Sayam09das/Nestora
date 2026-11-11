'use client';

import { motion, useReducedMotion } from 'framer-motion';

import type { StaffShiftDisplay } from '@/components/dashboard/staff-portal/staff-topbar-data';
import { cn } from '@/lib/utils';

const stateStyles: Record<
  StaffShiftDisplay['state'],
  { dot: string; chip: string }
> = {
  on_duty: {
    dot: 'bg-emerald-400 shadow-[0_0_0_3px_color-mix(in_srgb,emerald_500_35%,transparent)]',
    chip:
      'border-[color-mix(in_oklch,emerald_55%_28%,var(--border))] bg-[color-mix(in_oklch,emerald_50%_10%,var(--card))]',
  },
  upcoming: {
    dot: 'bg-[var(--nestora-gold)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--nestora-gold)_35%,transparent)]',
    chip:
      'border-[color-mix(in_oklch,var(--nestora-gold)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_12%,var(--card))]',
  },
  off_duty: {
    dot: 'bg-muted-foreground/50',
    chip: 'border-border bg-muted/40',
  },
  on_break: {
    dot: 'bg-sky-400 shadow-[0_0_0_3px_color-mix(in_srgb,sky_500_30%,transparent)]',
    chip: 'border-[color-mix(in_oklch,sky_55%_25%,var(--border))] bg-[color-mix(in_oklch,sky_50%_10%,var(--card))]',
  },
  completed: {
    dot: 'bg-[var(--nestora-sage)]',
    chip:
      'border-[color-mix(in_oklch,var(--nestora-sage)_30%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage)_10%,var(--card))]',
  },
};

type Props = {
  shift: StaffShiftDisplay;
  className?: string;
};

export function StaffShiftIndicator({ shift, className }: Props) {
  const reduceMotion = useReducedMotion();
  const styles = stateStyles[shift.state];

  return (
    <motion.div
      layout={!reduceMotion}
      className={cn(
        'hidden h-9 items-center gap-2 rounded-full border px-2.5 text-left xl:flex',
        styles.chip,
        className,
      )}
      role="status"
      aria-label={`${shift.label}, ${shift.timeWindow}`}
    >
      <span className="relative flex size-2 shrink-0 items-center justify-center" aria-hidden>
        <span className={cn('size-2 rounded-full', styles.dot)} />
        {shift.state === 'on_duty' && !reduceMotion ? (
          <motion.span
            className="absolute inset-0 rounded-full bg-emerald-400/40"
            animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
          />
        ) : null}
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block truncate text-[11px] font-semibold text-[var(--nestora-forest)]">{shift.label}</span>
        <span className="block truncate text-[10px] text-muted-foreground">{shift.timeWindow}</span>
      </span>
    </motion.div>
  );
}
