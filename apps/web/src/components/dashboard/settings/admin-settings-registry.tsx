'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';

import {
  CATEGORY_META,
  formatSettingsWhen,
  type SettingsPanel,
} from '@/components/dashboard/settings/admin-settings-data';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = { rows: SettingsPanel[]; hidden?: boolean; detailBasePath?: string };

export function AdminSettingsRegistry({ rows, hidden, detailBasePath = '/admin/settings' }: Props) {
  const reduceMotion = useReducedMotion();
  return (
    <section
      data-set-reveal
      data-set-flip
      className={cn('overflow-hidden rounded-2xl border bg-card shadow-sm', hidden && 'hidden')}
      aria-hidden={hidden}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[52rem] text-left text-sm">
          <thead>
            <tr className="border-b bg-[color-mix(in_oklch,var(--nestora-cream)_15%,var(--card))] text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-4 py-3">Panel</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Risk</th>
              <th className="px-4 py-3">Updated</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const Icon = CATEGORY_META[row.category].icon;
              return (
                <motion.tr
                  key={row.id}
                  initial={reduceMotion ? false : { opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.25) }}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <Link href={`${detailBasePath}/${row.id}`} className={cn('font-medium text-[var(--nestora-forest)]', focusRing)}>
                      <span className="block text-[11px] text-muted-foreground">
                        {row.code} · {row.frRef}
                      </span>
                      {row.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <Icon className="size-3.5" aria-hidden />
                      {row.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="rounded-full text-[10px]">
                      {row.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs capitalize text-muted-foreground">{row.risk}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    <time dateTime={row.lastModified}>{formatSettingsWhen(row.lastModified)}</time>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
