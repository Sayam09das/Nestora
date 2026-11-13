'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';

import {
  LEAVE_STATUS_STYLES,
  formatLeaveDate,
  leaveDurationDays,
  type LeaveRecord,
} from '@/components/dashboard/leave/admin-leave-data';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  rows: LeaveRecord[];
  hidden?: boolean;
  gatePassLog?: boolean;
};

export function AdminLeaveDirectory({ rows, hidden, gatePassLog = false }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <section
      data-leave-reveal
      data-leave-flip
      aria-label="Leave registry"
      hidden={hidden}
      className={cn(hidden && 'hidden')}
    >
      <div className="overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card shadow-sm">
        {gatePassLog ? (
          <div className="border-b border-[var(--nestora-sage-muted)]/70 px-4 py-3 text-xs text-muted-foreground">
            Gate pass log — tokens issued for approved leave and outings (MOD-10).
          </div>
        ) : null}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead>
              <tr className="border-b bg-[color-mix(in_oklch,var(--nestora-cream)_15%,var(--card))] text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                <th className="px-4 py-3">Leave</th>
                <th className="px-4 py-3">Resident</th>
                <th className="px-4 py-3">Window</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Gate pass</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <motion.tr
                  key={row.id}
                  initial={reduceMotion ? false : { opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  className="border-b last:border-0 hover:bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--card))]"
                >
                  <td className="px-4 py-3">
                    <Link href={`/admin/leave/${row.id}`} className={cn('font-medium text-[var(--nestora-forest)]', focusRing)}>
                      <span className="block text-[11px] text-muted-foreground">{row.leaveRef}</span>
                      {row.destination}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {row.studentName}
                    <span className="block text-[11px]">{row.roomBed}</span>
                  </td>
                  <td className="px-4 py-3 text-xs tabular-nums text-muted-foreground">
                    {formatLeaveDate(row.departureDate)} → {formatLeaveDate(row.expectedReturnDate)}
                    <span className="block text-[11px]">{leaveDurationDays(row.departureDate, row.expectedReturnDate)} days</span>
                  </td>
                  <td className="px-4 py-3 text-xs">{row.category}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={cn('rounded-full text-xs', LEAVE_STATUS_STYLES[row.status])}>
                      {row.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{row.gatePassToken ?? '—'}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">No leave records match filters.</p> : null}
      </div>
    </section>
  );
}
