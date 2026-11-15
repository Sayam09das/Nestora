'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  Banknote,
  CreditCard,
  Loader2,
  Receipt,
  RefreshCw,
  Scale,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useRef } from 'react';
import { toast } from 'sonner';

import { formatInr } from '@/components/dashboard/student-portal/home/student-dashboard-data';
import { useStudentShell } from '@/components/dashboard/student-portal/student-shell-provider';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useStudentFeesDesk } from '@/hooks/use-student-fees-desk';
import type { StudentFeeAdjustmentRow, StudentFeePayment } from '@/lib/api/student-fees';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;
const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

const accountStatusStyles = {
  cleared:
    'border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage-light)_50%,var(--card))] text-[var(--nestora-forest)]',
  current:
    'border-[color-mix(in_oklch,var(--nestora-gold)_40%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_14%,var(--card))]',
  due: 'border-[color-mix(in_oklch,#dc2626_25%,var(--border))] bg-[color-mix(in_oklch,#dc2626_8%,var(--card))] text-[#991b1b]',
  no_ledger: 'border-border bg-muted/30 text-muted-foreground',
} as const;

function formatSyncTime(iso: string | undefined): string {
  if (!iso) return 'Syncing…';
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(iso));
}

function PaymentCard({
  item,
  index,
  reduceMotion,
}: {
  item: StudentFeePayment;
  index: number;
  reduceMotion: boolean | null;
}) {
  return (
    <motion.li
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.32, ease: motionEase }}
      className="rounded-2xl border border-border bg-card p-4 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-mono text-[11px] text-muted-foreground">{item.receiptNumber}</p>
          <p className="mt-0.5 text-lg font-bold tabular-nums text-[var(--nestora-forest)]">
            {formatInr(item.amount)}
          </p>
        </div>
        <Badge variant="outline" className="text-xs font-semibold">
          {item.paymentModeLabel}
        </Badge>
      </div>
      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[10px] font-semibold uppercase text-muted-foreground">Payment date</dt>
          <dd>{item.paymentDate}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase text-muted-foreground">Reference</dt>
          <dd className="font-mono text-xs">{item.transactionReference}</dd>
        </div>
      </dl>
      <p className="mt-3 border-t border-border pt-2 text-[11px] text-muted-foreground">
        Recorded {item.recordedAt}
      </p>
    </motion.li>
  );
}

function AdjustmentRow({ item }: { item: StudentFeeAdjustmentRow }) {
  return (
    <li className="rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold text-foreground">{item.adjustmentTypeLabel}</span>
        <span className="font-bold tabular-nums text-[var(--nestora-forest)]">{formatInr(item.amount)}</span>
      </div>
      <p className="mt-1 text-muted-foreground">{item.reason}</p>
      <p className="mt-2 text-xs text-muted-foreground">
        {item.statusLabel} · {item.createdAt}
      </p>
    </li>
  );
}

function FeesSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-36 w-full rounded-2xl" />
      <div className="grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  );
}

export function StudentFeesPage() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const { desk, loading, error, isRefreshing, refresh } = useStudentFeesDesk();
  const { feesOnlineEnabled } = useStudentShell();

  const syncLabel = useMemo(() => formatSyncTime(desk?.generatedAt), [desk?.generatedAt]);
  const summary = desk?.summary;
  const paidPercent = summary?.paidPercent ?? 0;

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-student-fees-block]'), {
        opacity: 0,
        y: 14,
        duration: 0.42,
        stagger: 0.06,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: rootRef, dependencies: [reduceMotion, desk?.payments.length] },
  );

  const onPayOnline = () => {
    if (desk?.payOnlineAvailable) {
      toast.message('Online payment will open here when your hostel enables the gateway.');
      return;
    }
    toast.info(desk?.payOnlineNote ?? 'Pay at the hostel accounts office.');
  };

  return (
    <div ref={rootRef} className="space-y-6 pb-8">
      <header data-student-fees-block className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <motion.div className="flex items-center gap-2">
            <CreditCard className="size-5 text-[var(--nestora-gold)]" aria-hidden />
            <h1 className="text-2xl font-bold tracking-tight text-[var(--nestora-forest)]">Fee &amp; Payments</h1>
          </motion.div>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Ledger balance, receipts, and your room fee schedule. Updates every 20 seconds while this page is open.
          </p>
          <motion.div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] bg-card px-3 py-1 text-xs font-medium text-[var(--nestora-forest)]">
              Live · {syncLabel}
              {isRefreshing ? ' · refreshing' : ''}
            </span>
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => refresh()} disabled={loading}>
              {loading || isRefreshing ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
              Refresh
            </Button>
            <Link href="/student" className={cn('text-sm font-semibold text-[var(--nestora-forest)] hover:underline', focusRing)}>
              Back to dashboard
            </Link>
          </motion.div>
        </div>
        {feesOnlineEnabled && summary && summary.outstanding > 0 ? (
          <Button
            type="button"
            className={cn('gap-2 bg-[var(--nestora-forest)]', focusRing)}
            onClick={onPayOnline}
          >
            <Banknote className="size-4" aria-hidden />
            Pay fees
          </Button>
        ) : null}
      </header>

      {error ? (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          <span>{error}</span>
          <Button type="button" variant="outline" size="sm" onClick={() => refresh()}>
            Retry
          </Button>
        </div>
      ) : null}

      {loading && !desk ? <FeesSkeleton /> : null}

      {desk && summary ? (
        <>
          <section
            data-student-fees-block
            className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-gold)_22%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_6%,var(--card))] p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Outstanding</p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-[var(--nestora-forest)]">
                  {formatInr(summary.outstanding)}
                </p>
                {desk.registrationNumber ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Reg. {desk.registrationNumber}
                    {desk.hostelName ? ` · ${desk.hostelName}` : ''}
                  </p>
                ) : null}
              </div>
              <Badge variant="outline" className={cn('text-xs font-semibold', accountStatusStyles[summary.accountStatus])}>
                {summary.accountStatusLabel}
              </Badge>
            </div>

            <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-border bg-card/90 p-3">
                <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Wallet className="size-3.5" aria-hidden />
                  Total assessed
                </dt>
                <dd className="mt-1 font-semibold tabular-nums">{formatInr(summary.totalAssessed)}</dd>
              </div>
              <div className="rounded-xl border border-border bg-card/90 p-3">
                <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Receipt className="size-3.5" aria-hidden />
                  Paid
                </dt>
                <dd className="mt-1 font-semibold tabular-nums text-[var(--nestora-forest)]">
                  {formatInr(summary.totalPaid)}
                </dd>
              </div>
              <div className="rounded-xl border border-border bg-card/90 p-3">
                <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Scale className="size-3.5" aria-hidden />
                  Waived
                </dt>
                <dd className="mt-1 font-semibold tabular-nums">{formatInr(summary.totalWaived)}</dd>
              </div>
              <div className="rounded-xl border border-border bg-card/90 p-3">
                <dt className="text-xs text-muted-foreground">Due</dt>
                <dd className="mt-1 font-semibold">{summary.dueDateLabel}</dd>
              </div>
            </dl>

            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Paid progress</span>
                <span className="font-semibold tabular-nums text-foreground">{paidPercent}%</span>
              </div>
              <motion.div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                <motion.span
                  className="block h-full rounded-full bg-[var(--nestora-sage)]"
                  initial={reduceMotion ? { width: `${paidPercent}%` } : { width: 0 }}
                  animate={{ width: `${paidPercent}%` }}
                  transition={{ duration: 0.55, ease: motionEase }}
                />
              </motion.div>
            </div>
          </section>

          {desk.schedule ? (
            <section data-student-fees-block className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-base font-semibold text-[var(--nestora-forest)]">Fee schedule (your room type)</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">{desk.schedule.title}</p>
              <ul className="mt-4 divide-y divide-border rounded-xl border border-border">
                {desk.schedule.items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                    <span className="text-foreground">{item.itemName}</span>
                    <span className="font-semibold tabular-nums">{formatInr(item.amount)}</span>
                  </li>
                ))}
                <li className="flex items-center justify-between gap-3 bg-muted/30 px-4 py-3 text-sm font-semibold">
                  <span>Schedule total</span>
                  <span className="tabular-nums">{formatInr(desk.schedule.itemsTotal)}</span>
                </li>
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                Assessed amounts on your ledger may include prior semesters, deposits, or adjustments.
              </p>
            </section>
          ) : null}

          <section data-student-fees-block>
            <h2 className="text-base font-semibold text-[var(--nestora-forest)]">Payment history</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {desk.payments.length === 0
                ? 'No payments recorded yet.'
                : `${desk.payments.length} receipt${desk.payments.length === 1 ? '' : 's'} on file.`}
            </p>
            {desk.payments.length > 0 ? (
              <ul className="mt-4 grid gap-3 lg:grid-cols-2">
                {desk.payments.map((payment, index) => (
                  <PaymentCard key={payment.id} item={payment} index={index} reduceMotion={reduceMotion} />
                ))}
              </ul>
            ) : (
              <p className="mt-4 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
                After you pay at accounts, receipts appear here automatically.
              </p>
            )}
          </section>

          {desk.adjustments.length > 0 ? (
            <section data-student-fees-block>
              <h2 className="text-base font-semibold text-[var(--nestora-forest)]">Adjustments &amp; waivers</h2>
              <ul className="mt-3 grid gap-2">
                {desk.adjustments.map((row) => (
                  <AdjustmentRow key={row.id} item={row} />
                ))}
              </ul>
            </section>
          ) : null}

          <p data-student-fees-block className="rounded-xl border border-border bg-muted/25 px-4 py-3 text-sm text-muted-foreground">
            {desk.payOnlineNote}
          </p>
        </>
      ) : null}
    </div>
  );
}