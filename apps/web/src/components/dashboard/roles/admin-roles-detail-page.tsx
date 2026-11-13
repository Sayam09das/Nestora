'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { AdminRolesGrantDrawer } from '@/components/dashboard/roles/admin-roles-grant-drawer';
import {
  ROLE_ICONS,
  ROLE_PERMISSIONS,
  permissionLabel,
  type PermissionLevel,
  type RoleProfile,
} from '@/components/dashboard/roles/admin-roles-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
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
      return 'text-muted-foreground/40';
  }
};

export function AdminRolesDetailPage({
  role,
  assignments,
}: {
  role: RoleProfile;
  assignments?: Array<{ user: string; hostel: string; since: string }>;
}) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const matrixRef = useRef<HTMLTableSectionElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const Icon = ROLE_ICONS[role.id];
  const matrix = ROLE_PERMISSIONS[role.id] ?? [];
  const assignees = assignments ?? [];

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-role-detail]'), {
        opacity: 0,
        y: 10,
        stagger: 0.05,
        duration: 0.38,
        clearProps: 'opacity,transform',
      });
    },
    { scope: rootRef, dependencies: [reduceMotion, role.id] },
  );

  useGSAP(
    () => {
      if (reduceMotion || !matrixRef.current) return;
      gsap.from(matrixRef.current.querySelectorAll('tr'), {
        opacity: 0,
        x: -8,
        stagger: 0.04,
        duration: 0.35,
        clearProps: 'opacity,transform',
      });
    },
    { scope: matrixRef, dependencies: [role.id, reduceMotion], revertOnUpdate: true },
  );

  return (
    <div ref={rootRef} className="space-y-6 pb-8">
      <div data-role-detail className="flex flex-wrap items-center gap-3">
        <Button nativeButton={false} variant="outline" size="sm" className="rounded-xl" render={<Link href="/admin/roles" className={focusRing} />}>
          <ArrowLeft className="size-4" aria-hidden />
          Roles
        </Button>
        <p className="text-xs text-muted-foreground">
          {role.code} · <span className="font-medium text-foreground">{role.frRef}</span>
        </p>
      </div>

      <header data-role-detail className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold text-[var(--nestora-forest)]">
              {Icon ? <Icon className="size-6" aria-hidden /> : null}
              {role.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{role.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-full">
              {role.scope}
            </Badge>
            <Badge variant="outline" className="rounded-full capitalize">
              {role.risk} risk
            </Badge>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" className={cn('rounded-xl bg-[var(--nestora-forest)] text-white', focusRing)} onClick={() => setDrawerOpen(true)}>
            Grant this role
          </Button>
          <Button
            type="button"
            variant="outline"
            className={cn('rounded-xl', focusRing)}
            onClick={() => toast.message('Export matrix as PDF (sample).')}
          >
            Export matrix
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {role.activeUsers.toLocaleString('en-IN')} active users · tier {role.tier}
        </p>
      </header>

      <motion.section data-role-detail className="overflow-hidden rounded-2xl border bg-card shadow-sm" layout>
        <div className="border-b px-5 py-4">
          <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">Permission matrix</h2>
          <p className="text-xs text-muted-foreground">CRUD levels per module — sample policy until API wiring.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-[10px] font-bold uppercase text-muted-foreground">
                <th className="px-4 py-3">Module</th>
                <th className="px-4 py-3 text-center">Read</th>
                <th className="px-4 py-3 text-center">Create</th>
                <th className="px-4 py-3 text-center">Update</th>
                <th className="px-4 py-3 text-center">Delete</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody ref={matrixRef}>
              {matrix.map((row) => (
                <tr key={row.module} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium text-[var(--nestora-forest)]">{row.module}</td>
                  {(['read', 'create', 'update', 'delete'] as const).map((col) => (
                    <td key={col} className="px-4 py-3 text-center">
                      <span className={cn('inline-block min-w-[4rem] rounded-md px-2 py-0.5 text-xs', levelClass(row[col]))}>
                        {permissionLabel(row[col])}
                      </span>
                    </td>
                  ))}
                  <td className="px-4 py-3 text-xs text-muted-foreground">{row.notes ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>

      {assignees.length > 0 ? (
        <motion.section
          data-role-detail
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl border bg-card shadow-sm"
        >
          <div className="border-b px-5 py-4">
            <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">Sample assignees</h2>
          </div>
          <ul className="divide-y">
            {assignees.map((a) => (
              <li key={a.user} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
                <span className="font-medium">{a.user}</span>
                <span className="text-muted-foreground">{a.hostel}</span>
                <time className="text-xs text-muted-foreground" dateTime={a.since}>
                  since {a.since}
                </time>
              </li>
            ))}
          </ul>
        </motion.section>
      ) : null}

      <AdminRolesGrantDrawer open={drawerOpen} onOpenChange={setDrawerOpen} preselectId={role.id} />
    </div>
  );
}
