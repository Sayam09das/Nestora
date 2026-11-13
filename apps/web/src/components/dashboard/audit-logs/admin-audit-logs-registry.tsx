'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';

import {
  categorizeAction,
  formatAuditWhen,
  severityFor,
} from '@/components/dashboard/audit-logs/admin-audit-logs-data';
import type { AuditLogRow } from '@/lib/api/audit';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = { rows: AuditLogRow[]; hidden?: boolean };

export function AdminAuditLogsRegistry({ rows, hidden }: Props) {
  const reduceMotion = useReducedMotion();
  return (
    <section
      data-aud-reveal
      data-aud-flip
      className={cn('overflow-hidden rounded-2xl border bg-card shadow-sm', hidden && 'hidden')}
      aria-hidden={hidden}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[56rem] text-left text-sm">
          <thead>
            <tr className="border-b bg-[color-mix(in_oklch,var(--nestora-cream)_15%,var(--card))] text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entity</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">IP</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <motion.tr
                key={row.id}
                initial={reduceMotion ? false : { opacity: 0, x: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.2) }}
                className="border-b last:border-0 hover:bg-muted/30"
              >
                <td className="px-4 py-3 text-xs whitespace-nowrap text-muted-foreground">
                  <time dateTime={row.timestamp}>{formatAuditWhen(row.timestamp)}</time>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/audit-logs/${row.id}`} className={cn('font-mono text-xs font-medium text-[var(--nestora-forest)]', focusRing)}>
                    {row.actionName}
                  </Link>
                  <span className="mt-0.5 block text-[10px] text-muted-foreground">{categorizeAction(row.actionName)}</span>
                </td>
                <td className="px-4 py-3 text-xs">
                  <span className="text-muted-foreground">{row.entityType}</span>
                  <span className="block font-mono">{row.entityId}</span>
                </td>
                <td className="px-4 py-3 text-xs">
                  <span className="block">{row.actorRole}</span>
                  <span className="font-mono text-muted-foreground">{row.actorUserId ?? '—'}</span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="rounded-full text-[10px] capitalize">
                    {severityFor(row.actionName)}
                  </Badge>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{row.ipAddress ?? '—'}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
