'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { FileCheck, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';

import { formatInr, type LedgerAccount, type LedgerLine } from '@/components/dashboard/fees/admin-fees-data';
import type { FinanceCollectionTrendPoint, FinancePendingWaiver } from '@/lib/api/finance';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

const BAR_COLORS = ['#8ba391', '#6d9773', '#4d7a5c', '#2d5c45', '#164c3c', '#ffba00'] as const;

const chartConfig = {
  collected: { label: 'Collected', color: 'var(--nestora-forest)' },
  outstanding: { label: 'Outstanding', color: 'var(--nestora-gold)' },
} satisfies ChartConfig;

type Props = {
  account: LedgerAccount | null;
  onRequestWaiver: () => void;
  lines: LedgerLine[];
  collectionTrend: FinanceCollectionTrendPoint[];
  pendingWaivers: FinancePendingWaiver[];
  loadingDetail?: boolean;
};

export function AdminFeesLedgerPanel({
  account,
  onRequestWaiver,
  lines,
  collectionTrend,
  pendingWaivers,
  loadingDetail = false,
}: Props) {
  const reduceMotion = useReducedMotion();
  const chartRef = useRef<HTMLDivElement>(null);
  const chartData = collectionTrend.length ? collectionTrend : [{ month: '—', collected: 0, outstanding: 0 }];

  useGSAP(
    () => {
      if (reduceMotion || !chartRef.current || !account) return;
      const bars = chartRef.current.querySelectorAll('.recharts-bar-rectangle');
      if (!bars.length) return;
      gsap.from(bars, {
        scaleY: 0,
        transformOrigin: '50% 100%',
        duration: 0.5,
        stagger: 0.06,
        ease: 'back.out(1.2)',
        clearProps: 'transform',
      });
    },
    { scope: chartRef, dependencies: [account?.id, reduceMotion], revertOnUpdate: true },
  );

  if (!account) {
    return (
      <section className="rounded-2xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
        Select a ledger card to preview collection trend and line items.
      </section>
    );
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[1fr,18rem]">
      <article className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--nestora-forest)]">
              <Wallet className="size-5 text-[var(--nestora-sage)]" aria-hidden />
              {account.studentName}
            </h2>
            <p className="text-xs text-muted-foreground">
              {account.regNo} · {account.semester}
            </p>
          </div>
          <Button nativeButton={false} variant="outline" size="sm" className="rounded-xl" render={<Link href={`/admin/fees/${account.id}`} className={focusRing} />}>
            Full statement
          </Button>
        </div>

        <motion.div
          ref={chartRef}
          className="mt-4 rounded-xl border bg-[color-mix(in_oklch,var(--nestora-cream)_8%,var(--card))] p-3"
          key={account.id}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Campus collection trend</p>
          <ChartContainer config={chartConfig} className="aspect-[2.2/1] w-full max-h-48">
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted/40" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
              <YAxis hide tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`} />
              <ChartTooltip content={<ChartTooltipContent formatter={(v) => formatInr(Number(v))} />} />
              <Bar dataKey="collected" radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </motion.div>

        <div className="mt-4 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Recent ledger lines</p>
          <ul className="divide-y rounded-xl border">
            {loadingDetail ? (
              <li className="px-3 py-4 text-center text-xs text-muted-foreground">Loading ledger lines…</li>
            ) : lines.length === 0 ? (
              <li className="px-3 py-4 text-center text-xs text-muted-foreground">No ledger lines yet.</li>
            ) : (
              lines.map((line) => (
                <li key={`${line.date}-${line.label}`} className="flex items-center justify-between gap-2 px-3 py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-foreground">{line.label}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {line.type} · {line.date}
                      {line.ref ? ` · ${line.ref}` : ''}
                    </p>
                  </div>
                  <span className={cn('tabular-nums font-medium', line.amount < 0 ? 'text-[var(--nestora-forest)]' : 'text-foreground')}>
                    {formatInr(Math.abs(line.amount))}
                    {line.amount < 0 ? ' cr' : ''}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </article>

      <aside className="space-y-4">
        <motion.article
          initial={reduceMotion ? false : { opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl border bg-card p-4 shadow-sm"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Balance snapshot</p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Assessed</dt>
              <dd className="font-medium tabular-nums">{formatInr(account.assessed)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Paid</dt>
              <dd className="font-medium tabular-nums text-[var(--nestora-forest)]">{formatInr(account.paid)}</dd>
            </div>
            <div className="flex justify-between gap-2 border-t pt-2">
              <dt className="font-medium">Outstanding</dt>
              <dd className="text-lg font-semibold tabular-nums text-[var(--nestora-gold)]">{formatInr(account.outstanding)}</dd>
            </div>
          </dl>
        </motion.article>

        <motion.article
          initial={reduceMotion ? false : { opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border bg-card p-4 shadow-sm"
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-[var(--nestora-forest)]">
              <FileCheck className="size-4" aria-hidden />
              Waiver queue
            </h3>
            <Button type="button" variant="ghost" size="sm" className={cn('h-7 text-xs', focusRing)} onClick={onRequestWaiver}>
              Review
            </Button>
          </div>
          <ul className="mt-3 space-y-2">
            {pendingWaivers.length === 0 ? (
              <li className="rounded-lg border border-dashed px-3 py-2 text-center text-[11px] text-muted-foreground">No pending waivers.</li>
            ) : null}
            {pendingWaivers.map((w) => (
              <li key={w.id} className="rounded-lg border bg-muted/20 px-3 py-2">
                <p className="text-xs font-medium">{w.student}</p>
                <p className="text-[11px] text-muted-foreground">
                  {formatInr(w.amount)} · {w.reason}
                </p>
                <Badge variant="outline" className="mt-1 rounded-full text-[10px]">
                  {w.status} · {w.frRef}
                </Badge>
              </li>
            ))}
          </ul>
        </motion.article>
      </aside>
    </section>
  );
}
