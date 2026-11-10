'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';

import {
  CATEGORY_META,
  NOTICE_STATUS_STYLES,
  ackRate,
  formatNoticeWhen,
  type AnnouncementRecord,
} from '@/components/dashboard/announcements/admin-announcements-data';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  rows: AnnouncementRecord[];
  hidden?: boolean;
};

export function AdminAnnouncementsList({ rows, hidden }: Props) {
  const reduceMotion = useReducedMotion();

  if (hidden) return null;

  return (
    <section data-ann-reveal data-ann-flip aria-label="Notice registry">
      <div className="overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card shadow-sm">
        <motion.div className="overflow-x-auto" initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }}>
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead>
              <tr className="border-b bg-[color-mix(in_oklch,var(--nestora-cream)_15%,var(--card))] text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                <th className="px-4 py-3">Notice</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Scope</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Ack</th>
                <th className="px-4 py-3">Published</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const meta = CATEGORY_META[row.category];
                const Icon = meta.icon;
                return (
                  <tr key={row.id} className="border-b last:border-0 hover:bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--card))]">
                    <td className="px-4 py-3">
                      <Link href={`/admin/announcements/${row.id}`} className={cn('font-medium text-[var(--nestora-forest)]', focusRing)}>
                        <span className="block text-[11px] text-muted-foreground">{row.noticeRef}</span>
                        {row.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs">
                        <Icon className="size-3.5" style={{ color: meta.accent }} aria-hidden />
                        {row.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{row.scope}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={cn('rounded-full text-xs', NOTICE_STATUS_STYLES[row.status])}>
                        {row.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs tabular-nums text-muted-foreground">
                      {row.requiresAcknowledgement ? `${ackRate(row)}%` : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      <time dateTime={row.publishedAt}>{formatNoticeWhen(row.publishedAt)}</time>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
        {rows.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">No notices match filters.</p> : null}
      </div>
    </section>
  );
}
