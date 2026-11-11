'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, CreditCard } from 'lucide-react';
import Link from 'next/link';

import { formatInr, type StudentDashboardSnapshot } from '@/components/dashboard/student-portal/home/student-dashboard-data';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;
const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = { snapshot: StudentDashboardSnapshot };

export function StudentDashboardFeesPanel({ snapshot }: Props) {
  const reduceMotion = useReducedMotion();
  const paidRatio = Math.round((snapshot.feesPaid / snapshot.feesTotal) * 100);

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05, ease: motionEase }}
      className="flex h-full flex-col rounded-2xl border border-[color-mix(in_oklch,var(--nestora-gold)_22%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_6%,var(--card))] p-5 shadow-sm"
      aria-labelledby="student-fees-heading"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <motion.div className="flex items-center gap-2">
            <CreditCard className="size-4 text-[var(--nestora-gold)]" aria-hidden />
            <h2 id="student-fees-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
              Fee Summary
            </h2>
          </motion.div>
          <p className="mt-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-[#c2410c]">
            <AlertCircle className="size-3.5" aria-hidden />
            Payment Due
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-[color-mix(in_oklch,var(--nestora-gold)_25%,var(--border))] bg-card p-4">
        <p className="text-xs font-medium text-muted-foreground">Outstanding Amount</p>
        <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--nestora-forest)]">
          {formatInr(snapshot.feesOutstanding)}
        </p>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border border-border bg-card/80 p-3">
          <dt className="text-xs text-muted-foreground">Total Fees</dt>
          <dd className="mt-0.5 font-semibold tabular-nums text-foreground">{formatInr(snapshot.feesTotal)}</dd>
        </div>
        <div className="rounded-lg border border-border bg-card/80 p-3">
          <dt className="text-xs text-muted-foreground">Paid Amount</dt>
          <dd className="mt-0.5 font-semibold tabular-nums text-[var(--nestora-forest)]">{formatInr(snapshot.feesPaid)}</dd>
        </div>
        <div className="col-span-2 rounded-lg border border-border bg-card/80 p-3">
          <dt className="text-xs text-muted-foreground">Due Date</dt>
          <dd className="mt-0.5 font-semibold text-foreground">{snapshot.feesDueDate}</dd>
        </div>
      </dl>

      <div className="mt-4">
        <motion.div className="flex justify-between text-xs text-muted-foreground">
          <span>Paid progress</span>
          <span className="font-semibold tabular-nums text-foreground">{paidRatio}%</span>
        </motion.div>
        <button type="button" className="pointer-events-none mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <motion.span
            className="block h-full rounded-full bg-[var(--nestora-sage)]"
            initial={reduceMotion ? { width: `${paidRatio}%` } : { width: 0 }}
            animate={{ width: `${paidRatio}%` }}
            transition={{ duration: 0.55, ease: motionEase }}
          />
        </button>
      </div>

      <div className="mt-auto pt-4">
        <Link
          href="/student/fees"
          className={cn(
            'inline-flex h-9 w-full items-center justify-center border border-[var(--nestora-forest)] bg-background px-2.5 text-xs font-medium text-[var(--nestora-forest)] transition-colors hover:bg-muted',
            focusRing,
          )}
        >
          View Fee Details
        </Link>
      </div>
    </motion.section>
  );
}
