'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, Circle, History, ShieldCheck } from 'lucide-react';

import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

const STEPS = [
  { id: 'tier1', label: 'Admin tier-1', detail: 'University administrator verifies institutional eligibility (FR-011).' },
  { id: 'tier2', label: 'Warden tier-2', detail: 'You confirm hostel suitability with remarks (FR-012).' },
  { id: 'final', label: 'Full admission', detail: 'Both tiers required before bed allocation (FR-013).' },
] as const;

type Props = {
  compact?: boolean;
};

export function WardenStudentsVerificationGuide({ compact = false }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: motionEase }}
      className={cn(
        'rounded-2xl border border-[color-mix(in_oklch,var(--nestora-gold)_28%,var(--border))]',
        'bg-[linear-gradient(135deg,color-mix(in_oklch,var(--nestora-gold)_10%,var(--card))_0%,var(--card)_55%)] p-4 shadow-sm sm:p-5',
      )}
      aria-labelledby="warden-verification-guide-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="warden-verification-guide-heading" className="flex items-center gap-2 text-sm font-semibold text-[var(--nestora-forest)]">
            <ShieldCheck className="size-4 text-[var(--nestora-gold)]" aria-hidden />
            Two-tier admission workflow
          </h2>
          {!compact ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Review admin-verified applications in the verification queue. Actions are audit-logged (FR-016).
            </p>
          ) : null}
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-card px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
          <History className="size-3" aria-hidden />
          Audit trail on submit
        </span>
      </div>

      <ol className={cn('mt-4 grid gap-3', compact ? 'sm:grid-cols-3' : 'md:grid-cols-3')}>
        {STEPS.map((step, index) => {
          const isCurrent = step.id === 'tier2';
          return (
            <li
              key={step.id}
              className={cn(
                'rounded-xl border px-3 py-3',
                isCurrent
                  ? 'border-[var(--nestora-gold)] bg-[color-mix(in_oklch,var(--nestora-gold)_12%,var(--card))]'
                  : 'border-border/80 bg-card/80',
              )}
            >
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-foreground">
                {isCurrent ? (
                  <CheckCircle2 className="size-3.5 text-[var(--nestora-gold)]" aria-hidden />
                ) : index === 0 ? (
                  <CheckCircle2 className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
                ) : (
                  <Circle className="size-3.5 text-muted-foreground" aria-hidden />
                )}
                Step {index + 1}
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--nestora-forest)]">{step.label}</p>
              <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{step.detail}</p>
            </li>
          );
        })}
      </ol>
    </motion.section>
  );
}
