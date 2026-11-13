'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';

import { formatFeeWhen, formatInr, type LedgerAccount } from '@/components/dashboard/fees/admin-fees-data';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = { rows: LedgerAccount[]; hidden?: boolean };

export function AdminFeesRegistry({ rows, hidden }: Props) {
  const reduceMotion = useReducedMotion();
  if (hidden) return null;

  return (
    <section data-fee-reveal data-fee-flip className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[52rem] text-left text-sm">
          <thead>
            <tr className="border-b bg-[color-mix(in_oklch,var(--nestora-cream)_15%,var(--card))] text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Hostel</th>
              <th className="px-4 py-3">Semester</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Outstanding</th>
              <th className="px-4 py-3">Last payment</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <motion.tr
                key={row.id}
                initial={reduceMotion ? false : { opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.25) }}
                className="border-b last:border-0 hover:bg-muted/30"
              >
                <td className="px-4 py-3">
                  <Link href={`/admin/fees/${row.id}`} className={cn('font-medium text-[var(--nestora-forest)]', focusRing)}>
                    <span className="block text-[11px] text-muted-foreground">
                      {row.code} · {row.regNo}
                    </span>
                    {row.studentName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {row.hostel} · {row.room}
                </td>
                <td className="px-4 py-3 text-xs">{row.semester}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="rounded-full text-[10px]">
                    {row.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right font-medium tabular-nums">{formatInr(row.outstanding)}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  <time dateTime={row.lastPayment ?? undefined}>{formatFeeWhen(row.lastPayment)}</time>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
