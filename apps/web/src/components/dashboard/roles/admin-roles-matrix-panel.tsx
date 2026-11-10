'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Grid3x3 } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

import {
  ROLE_ICONS,
  ROLE_PERMISSIONS,
  permissionLabel,
  type PermissionLevel,
  type RoleProfile,
} from '@/components/dashboard/roles/admin-roles-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

const levelClass = (level: PermissionLevel): string => {
  switch (level) {
    case 'admin':
      return 'bg-[color-mix(in_oklch,var(--nestora-forest)_18%,var(--muted))] text-[var(--nestora-forest)] font-semibold';
    case 'write':
      return 'bg-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--muted))] text-[var(--nestora-forest)]';
    case 'read':
      return 'bg-muted text-muted-foreground';
    default:
      return 'bg-transparent text-muted-foreground/50';
  }
};

type Props = { role: RoleProfile | null };

export function AdminRolesMatrixPanel({ role }: Props) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const rows = role ? (ROLE_PERMISSIONS[role.id] ?? []).slice(0, 5) : [];

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current || !role) return;
      gsap.from(rootRef.current.querySelectorAll('[data-role-cell]'), {
        opacity: 0,
        scale: 0.9,
        duration: 0.32,
        stagger: 0.04,
        ease: 'back.out(1.2)',
        clearProps: 'opacity,transform',
      });
    },
    { scope: rootRef, dependencies: [role?.id, reduceMotion], revertOnUpdate: true },
  );

  if (!role) {
    return (
      <section className="rounded-2xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
        Select a role to preview its permission matrix.
      </section>
    );
  }

  const Icon = ROLE_ICONS[role.id];

  return (
    <motion.section ref={rootRef} data-role-reveal layout className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-4 sm:px-5">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--nestora-sage)]">
            <Grid3x3 className="size-3.5" aria-hidden />
            Matrix preview
          </p>
          <h2 className="mt-1 flex items-center gap-2 text-lg font-semibold text-[var(--nestora-forest)]">
            {Icon ? <Icon className="size-5" aria-hidden /> : null}
            {role.title}
          </h2>
          <p className="text-xs text-muted-foreground">{role.scope} · {role.frRef}</p>
        </div>
        <Button nativeButton={false} size="sm" className={cn('rounded-xl', focusRing)} render={<Link href={`/admin/roles/${role.id}`} />}>
          Full matrix
        </Button>
      </header>
      <div className="overflow-x-auto p-4 sm:p-5">
        <table className="w-full min-w-[28rem] text-left text-xs">
          <thead>
            <tr className="text-[10px] font-bold uppercase text-muted-foreground">
              <th className="pb-2 pr-2">Module</th>
              <th className="pb-2 px-2 text-center">Read</th>
              <th className="pb-2 px-2 text-center">Create</th>
              <th className="pb-2 px-2 text-center">Update</th>
              <th className="pb-2 pl-2 text-center">Delete</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.module} className="border-t">
                <td className="py-2.5 pr-2 font-medium text-[var(--nestora-forest)]">{row.module}</td>
                {(['read', 'create', 'update', 'delete'] as const).map((col) => {
                  const level = row[col];
                  return (
                    <td key={col} className="px-2 py-2.5 text-center">
                      <span data-role-cell className={cn('inline-block min-w-[3.25rem] rounded-md px-2 py-0.5', levelClass(level))}>
                        {permissionLabel(level)}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length < (ROLE_PERMISSIONS[role.id]?.length ?? 0) ? (
          <p className="mt-3 text-[11px] text-muted-foreground">Showing 5 of {ROLE_PERMISSIONS[role.id]?.length} modules.</p>
        ) : null}
      </div>
    </motion.section>
  );
}
