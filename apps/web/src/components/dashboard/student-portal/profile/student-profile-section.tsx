'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

type Props = {
  id: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function StudentProfileSection({ id, title, description, action, children, className }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      data-student-profile-block
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: motionEase }}
      aria-labelledby={id}
      className={cn(
        'rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card p-5 shadow-sm sm:p-6',
        className,
      )}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id={id} className="text-base font-semibold text-[var(--nestora-forest)]">
            {title}
          </h2>
          {description ? <p className="mt-0.5 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </motion.section>
  );
}

export function StudentProfileField({
  label,
  value,
  readOnly = true,
}: {
  label: string;
  value: string;
  readOnly?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-[color-mix(in_oklch,var(--nestora-sage-muted)_80%,var(--border))] py-3 last:border-0">
      <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
        {readOnly ? (
          <span className="sr-only">(read-only)</span>
        ) : (
          <span className="rounded bg-[color-mix(in_oklch,var(--nestora-sage)_12%,var(--muted))] px-1 py-px text-[8px] font-semibold normal-case tracking-normal text-[var(--nestora-forest)]">
            Editable
          </span>
        )}
      </dt>
      <dd className="text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}
