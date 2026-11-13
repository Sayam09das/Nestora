'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

import { STATUS_META, formatInr, formatFeeWhen, type LedgerAccount } from '@/components/dashboard/fees/admin-fees-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  accounts: LedgerAccount[];
  selectedId: string;
  onSelect: (id: string) => void;
  listKey: string;
  hidden?: boolean;
  activeSchedules?: number | null;
};

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-8 items-end gap-0.5" aria-hidden>
      {values.map((v, i) => (
        <i
          key={i}
          className="w-1.5 rounded-sm bg-[color-mix(in_oklch,var(--nestora-forest)_55%,var(--border))]"
          style={{ height: `${Math.round((v / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

const statusTone: Record<LedgerAccount['status'], string> = {
  Current: 'bg-[color-mix(in_oklch,var(--nestora-sage)_20%,var(--muted))] text-[var(--nestora-forest)]',
  'Due soon': 'bg-amber-500/15 text-amber-900 dark:text-amber-100',
  Overdue: 'bg-red-500/15 text-red-900 dark:text-red-100',
  Cleared: 'bg-[color-mix(in_oklch,var(--nestora-forest)_12%,var(--muted))] text-[var(--nestora-forest)]',
};

export function AdminFeesDesk({ accounts, selectedId, onSelect, listKey, hidden, activeSchedules }: Props) {
  const reduceMotion = useReducedMotion();
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reduceMotion || !gridRef.current || hidden) return;
      gsap.from(gridRef.current.querySelectorAll('[data-fee-card]'), {
        opacity: 0,
        scale: 0.92,
        y: 14,
        stagger: { each: 0.05, grid: 'auto' },
        ease: 'back.out(1.15)',
        clearProps: 'opacity,transform',
      });
    },
    { scope: gridRef, dependencies: [listKey, hidden, reduceMotion] },
  );

  if (hidden) return null;

  return (
    <div className="space-y-4">
      {activeSchedules != null ? (
        <section data-fee-reveal className="rounded-xl border bg-[color-mix(in_oklch,var(--nestora-cream)_10%,var(--card))] px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Fee schedules</p>
          <p className="mt-1 text-sm font-medium text-[var(--nestora-forest)]">
            {activeSchedules} active schedule{activeSchedules === 1 ? '' : 's'} in database
          </p>
        </section>
      ) : null}

      <div ref={gridRef} data-fee-flip className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {accounts.map((acct) => {
          const active = acct.id === selectedId;
          const accent = STATUS_META[acct.status].accent;
          return (
            <motion.article
              key={acct.id}
              data-fee-card
              layout={!reduceMotion}
              className={cn(
                'overflow-hidden rounded-2xl border bg-[color-mix(in_oklch,var(--nestora-cream)_8%,var(--card))] shadow-sm backdrop-blur-[2px] transition-shadow',
                active
                  ? 'border-[var(--nestora-forest)] ring-2 ring-[color-mix(in_oklch,var(--nestora-sage)_25%,transparent)]'
                  : 'border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))]',
              )}
            >
              <button type="button" onClick={() => onSelect(acct.id)} className={cn('flex w-full flex-col p-4 text-left sm:p-5', focusRing)}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] text-muted-foreground">
                      {acct.code} · {acct.frRef}
                    </p>
                    <h3 className="mt-0.5 text-base font-semibold text-[var(--nestora-forest)]">{acct.studentName}</h3>
                    <p className="text-xs text-muted-foreground">
                      {acct.hostel} · {acct.room}
                    </p>
                  </div>
                  <Sparkline values={acct.sparkline} />
                </div>
                <div className="mt-4 flex items-end justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Outstanding</p>
                    <p className="text-xl font-semibold tabular-nums" style={{ color: accent }}>
                      {formatInr(acct.outstanding)}
                    </p>
                  </div>
                  <Badge className={cn('rounded-full border-0 text-[10px]', statusTone[acct.status])}>{acct.status}</Badge>
                </div>
                <p className="mt-3 text-[11px] text-muted-foreground">
                  Paid {formatInr(acct.paid)} of {formatInr(acct.assessed)} · last payment{' '}
                  <time dateTime={acct.lastPayment ?? undefined}>{formatFeeWhen(acct.lastPayment)}</time>
                </p>
              </button>
              <div className="border-t px-4 py-2 sm:px-5">
                <Link
                  href={`/admin/fees/${acct.id}`}
                  className={cn('inline-flex items-center gap-1 text-xs font-medium text-[var(--nestora-forest)]', focusRing)}
                >
                  Open statement
                  <ArrowUpRight className="size-3.5" aria-hidden />
                </Link>
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
