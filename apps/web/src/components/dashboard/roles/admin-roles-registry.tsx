'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';

import { ROLE_ICONS, formatRoleWhen, type RoleProfile } from '@/components/dashboard/roles/admin-roles-data';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = { rows: RoleProfile[]; hidden?: boolean };

export function AdminRolesRegistry({ rows, hidden }: Props) {
  const reduceMotion = useReducedMotion();
  if (hidden) return null;

  return (
    <section data-role-reveal data-role-flip className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[52rem] text-left text-sm">
          <thead>
            <tr className="border-b bg-[color-mix(in_oklch,var(--nestora-cream)_15%,var(--card))] text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3">Scope</th>
              <th className="px-4 py-3">Active users</th>
              <th className="px-4 py-3">Risk</th>
              <th className="px-4 py-3">Last audit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const Icon = ROLE_ICONS[row.id];
              return (
                <motion.tr
                  key={row.id}
                  initial={reduceMotion ? false : { opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.25) }}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <Link href={`/admin/roles/${row.id}`} className={cn('font-medium text-[var(--nestora-forest)]', focusRing)}>
                      <span className="mb-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        {Icon ? <Icon className="size-3.5" aria-hidden /> : null}
                        {row.code} · {row.frRef}
                      </span>
                      {row.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs">{row.tier}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="rounded-full text-[10px]">
                      {row.scope}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-xs text-muted-foreground">{row.activeUsers.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-xs capitalize text-muted-foreground">{row.risk}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    <time dateTime={row.lastAudit}>{formatRoleWhen(row.lastAudit)}</time>
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
