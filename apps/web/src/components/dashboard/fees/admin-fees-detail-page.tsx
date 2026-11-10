'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Receipt } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { AdminFeesRecordDrawer } from '@/components/dashboard/fees/admin-fees-record-drawer';
import {
  LEDGER_LINES,
  formatFeeWhen,
  formatInr,
  type LedgerAccount,
} from '@/components/dashboard/fees/admin-fees-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

export function AdminFeesDetailPage({ account }: { account: LedgerAccount }) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [recordOpen, setRecordOpen] = useState(false);
  const lines = LEDGER_LINES[account.id] ?? [];

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-fee-detail]'), {
        opacity: 0,
        y: 10,
        stagger: 0.05,
        duration: 0.38,
        clearProps: 'opacity,transform',
      });
    },
    { scope: rootRef, dependencies: [reduceMotion, account.id] },
  );

  const sendReminder = () => {
    toast.success(`Payment reminder queued for ${account.studentName} (FR-082 sample).`);
  };

  return (
    <div ref={rootRef} className="space-y-6 pb-8">
      <div data-fee-detail className="flex flex-wrap items-center gap-3">
        <Button nativeButton={false} variant="outline" size="sm" className="rounded-xl" render={<Link href="/admin/fees" className={focusRing} />}>
          <ArrowLeft className="size-4" aria-hidden />
          Finance desk
        </Button>
        <p className="text-xs text-muted-foreground">
          {account.code} · <span className="font-medium text-foreground">{account.frRef}</span>
        </p>
      </div>

      <header data-fee-detail className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--nestora-forest)]">{account.studentName}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {account.regNo} · {account.hostel} · {account.room} · {account.semester}
            </p>
          </div>
          <Badge variant="outline" className="rounded-full">
            {account.status}
          </Badge>
        </div>
        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          <motion.div whileHover={reduceMotion ? undefined : { y: -2 }} className="rounded-xl border bg-muted/20 p-4">
            <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Assessed</dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums">{formatInr(account.assessed)}</dd>
          </motion.div>
          <motion.div whileHover={reduceMotion ? undefined : { y: -2 }} className="rounded-xl border bg-muted/20 p-4">
            <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Paid</dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums text-[var(--nestora-forest)]">{formatInr(account.paid)}</dd>
          </motion.div>
          <motion.div whileHover={reduceMotion ? undefined : { y: -2 }} className="rounded-xl border bg-muted/20 p-4">
            <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Outstanding</dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums text-[var(--nestora-gold)]">{formatInr(account.outstanding)}</dd>
          </motion.div>
        </dl>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" className={cn('rounded-xl bg-[var(--nestora-forest)] text-white', focusRing)} onClick={() => setRecordOpen(true)}>
            <Receipt className="size-4" aria-hidden />
            Record payment
          </Button>
          <Button type="button" variant="outline" className={cn('rounded-xl', focusRing)} onClick={sendReminder}>
            Send reminder
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Last payment <time dateTime={account.lastPayment}>{formatFeeWhen(account.lastPayment)}</time>
        </p>
      </header>

      <section data-fee-detail className="rounded-2xl border bg-card shadow-sm">
        <div className="border-b px-5 py-4">
          <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">Statement lines</h2>
          <p className="text-xs text-muted-foreground">Charges, payments, waivers, and late fees for this ledger.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead>
              <tr className="border-b text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                <th className="px-5 py-3">Description</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lines.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">
                    No statement lines in sample data.
                  </td>
                </tr>
              ) : (
                lines.map((line) => (
                  <tr key={`${line.date}-${line.label}`} className="border-b last:border-0">
                    <td className="px-5 py-3 font-medium">{line.label}</td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{line.type}</td>
                    <td className="px-5 py-3 text-xs">{line.date}</td>
                    <td className={cn('px-5 py-3 text-right tabular-nums font-medium', line.amount < 0 && 'text-[var(--nestora-forest)]')}>
                      {line.amount < 0 ? `−${formatInr(Math.abs(line.amount))}` : formatInr(line.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <AdminFeesRecordDrawer open={recordOpen} onOpenChange={setRecordOpen} preselectAccountId={account.id} />
    </div>
  );
}
