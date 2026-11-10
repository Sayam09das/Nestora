'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';

import {
  CATEGORY_META,
  PRIORITY_STYLES,
  effectivePriority,
  formatComplaintWhen,
  type ComplaintTicket,
} from '@/components/dashboard/complaints/admin-complaints-data';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  tickets: ComplaintTicket[];
  hidden?: boolean;
};

export function AdminComplaintsList({ tickets, hidden }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <section data-cmp-reveal aria-label="Ticket registry" hidden={hidden} className={cn(hidden && 'hidden')}>
      <div className="overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead>
              <tr className="border-b bg-[color-mix(in_oklch,var(--nestora-cream)_15%,var(--card))] text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                <th className="px-4 py-3 font-bold">Ticket</th>
                <th className="px-4 py-3 font-bold">Category</th>
                <th className="px-4 py-3 font-bold">Student</th>
                <th className="px-4 py-3 font-bold">Priority</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Assignee</th>
                <th className="px-4 py-3 font-bold">Updated</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket, i) => {
                const meta = CATEGORY_META[ticket.category];
                const Icon = meta.icon;
                const priority = effectivePriority(ticket);
                return (
                  <motion.tr
                    key={ticket.id}
                    data-cmp-flip
                    initial={reduceMotion ? false : { opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                    className="border-b last:border-0 hover:bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--card))]"
                  >
                    <td className="px-4 py-3">
                      <Link href={`/admin/complaints/${ticket.id}`} className={cn('block font-medium text-[var(--nestora-forest)]', focusRing)}>
                        <span className="block text-[11px] text-muted-foreground">{ticket.ticketNumber}</span>
                        {ticket.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs">
                        <Icon className="size-3.5" style={{ color: meta.accent }} aria-hidden />
                        {ticket.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {ticket.studentName}
                      <span className="block text-[11px]">{ticket.location}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase', PRIORITY_STYLES[priority])}>
                        {priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="rounded-full text-xs">
                        {ticket.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{ticket.assignedStaff ?? '—'}</td>
                    <td className="px-4 py-3 text-xs tabular-nums text-muted-foreground">
                      <time dateTime={ticket.updatedAt}>{formatComplaintWhen(ticket.updatedAt)}</time>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {tickets.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">No tickets match filters.</p> : null}
      </div>
    </section>
  );
}
