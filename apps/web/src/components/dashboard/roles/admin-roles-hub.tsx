'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

import {
  ROLE_ICONS,
  TIER_META,
  formatRoleWhen,
  type RoleProfile,
} from '@/components/dashboard/roles/admin-roles-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  roles: RoleProfile[];
  selectedId: string;
  onSelect: (id: string) => void;
  listKey: string;
  hidden?: boolean;
};

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-8 items-end gap-0.5" aria-hidden>
      {values.map((v, i) => (
        <i
          key={i}
          className="w-1.5 rounded-sm bg-[color-mix(in_oklch,var(--nestora-forest)_55%,var(--border))]"
          style={{ height: `${Math.round((v / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

export function AdminRolesHub({ roles, selectedId, onSelect, listKey, hidden }: Props) {
  const reduceMotion = useReducedMotion();
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reduceMotion || !gridRef.current || hidden) return;
      gsap.from(gridRef.current.querySelectorAll('[data-role-card]'), {
        opacity: 0,
        scale: 0.92,
        y: 14,
        stagger: { each: 0.05, grid: 'auto' },
        ease: 'back.out(1.15)',
        clearProps: 'opacity,transform',
      });
    },
    { scope: gridRef, dependencies: [listKey, hidden, reduceMotion] },
  );

  return (
    <div
      ref={gridRef}
      data-role-reveal
      data-role-flip
      className={cn('grid gap-4 md:grid-cols-2 xl:grid-cols-3', hidden && 'hidden')}
      aria-hidden={hidden}
    >
      {roles.map((role) => {
        const Icon = ROLE_ICONS[role.id] ?? ShieldCheck;
        const meta = TIER_META[role.tier];
        const active = role.id === selectedId;
        return (
          <motion.article
            key={role.id}
            data-role-flip
            data-role-card
            layout={!reduceMotion}
            className={cn(
              'overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow',
              active
                ? 'border-[var(--nestora-forest)] ring-2 ring-[color-mix(in_oklch,var(--nestora-sage)_25%,transparent)]'
                : 'border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))]',
            )}
          >
            <button type="button" onClick={() => onSelect(role.id)} className={cn('flex w-full flex-col p-4 text-left sm:p-5', focusRing)}>
              <div className="flex items-start justify-between gap-2">
                <span className="flex size-11 items-center justify-center rounded-2xl border bg-[color-mix(in_oklch,var(--nestora-cream)_15%,var(--card))]" style={{ color: meta.accent }}>
                  <Icon className="size-5" aria-hidden />
                </span>
                <Badge variant="outline" className="rounded-full text-[10px]">
                  {role.frRef}
                </Badge>
              </div>
              <h3 className="mt-3 text-base font-semibold text-[var(--nestora-forest)]">{role.title}</h3>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{role.description}</p>
              <motion.div layout={false} className="mt-3 flex flex-wrap gap-2 text-[10px]">
                <span className="rounded-full bg-muted px-2 py-0.5 font-medium">{role.tier}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">{role.scope}</span>
              </motion.div>
              <div className="mt-3 flex items-end justify-between gap-2">
                <Sparkline values={role.sparkline} />
                <span className="text-[10px] tabular-nums text-muted-foreground">{role.activeUsers.toLocaleString('en-IN')} users</span>
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground">Audited {formatRoleWhen(role.lastAudit)}</p>
            </button>
            <div className="border-t px-4 py-2">
              <Link
                href={`/admin/roles/${role.id}`}
                className={cn('inline-flex items-center gap-1 text-xs font-semibold text-[var(--nestora-forest)]', focusRing)}
              >
                Permission matrix
                <ArrowUpRight className="size-3.5" aria-hidden />
              </Link>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
