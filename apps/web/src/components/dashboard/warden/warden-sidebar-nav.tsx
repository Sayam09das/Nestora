'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, type ReactNode } from 'react';

import type { WardenNavGroup, WardenNavLink } from '@/components/dashboard/warden/warden-nav-items';
import { filterWardenNavGroups } from '@/components/dashboard/warden/warden-nav-items';
import {
  createDefaultWardenPermissions,
  type WardenNavPermission,
} from '@/components/dashboard/warden/warden-nav-permissions';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/35';

const motionEase = [0.22, 1, 0.36, 1] as const;

type WardenSidebarNavProps = {
  groups: WardenNavGroup[];
  collapsed: boolean;
  onNavigate?: () => void;
  allowedPermissions?: ReadonlySet<WardenNavPermission>;
};

function NavIconButton({
  active,
  children,
  className,
}: {
  active: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors',
        active
          ? 'border-[color-mix(in_oklch,var(--nestora-gold)_35%,white)] bg-white/10'
          : 'border-white/10 bg-white/[0.04] group-hover:border-white/20',
        className,
      )}
    >
      {children}
    </span>
  );
}

function SidebarNavLink({
  item,
  collapsed,
  reduceMotion,
  onNavigate,
}: {
  item: WardenNavLink;
  collapsed: boolean;
  reduceMotion: boolean | null;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = item.isActive(pathname);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      title={collapsed ? item.label : undefined}
      className={cn(
        'group relative flex rounded-xl transition-colors duration-200',
        collapsed ? 'items-center justify-center px-2 py-2.5' : 'items-start gap-3 px-3 py-2.5',
        active ? 'bg-white/[0.1] text-white' : 'text-white/75 hover:bg-white/[0.06] hover:text-white',
        focusRing,
      )}
    >
      {active && !reduceMotion ? (
        <motion.span
          layoutId="warden-sidebar-active"
          className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-[var(--nestora-gold)]"
          transition={{ type: 'spring', stiffness: 520, damping: 34 }}
          aria-hidden
        />
      ) : active ? (
        <span
          className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-[var(--nestora-gold)]"
          aria-hidden
        />
      ) : null}
      <NavIconButton active={active} className={!collapsed ? 'ml-1' : undefined}>
        <Icon
          className={cn('size-4', active ? 'text-[var(--nestora-gold)]' : 'text-white/80')}
          aria-hidden
        />
      </NavIconButton>
      {!collapsed ? (
        <span className="min-w-0 flex-1 pt-0.5">
          <span className="block text-sm font-semibold leading-none">{item.label}</span>
          {item.description ? (
            <span className="mt-1 hidden text-[11px] leading-snug text-white/55 xl:block">{item.description}</span>
          ) : null}
        </span>
      ) : null}
    </Link>
  );
}

export function WardenSidebarNav({
  groups,
  collapsed,
  onNavigate,
  allowedPermissions,
}: WardenSidebarNavProps) {
  const reduceMotion = useReducedMotion();
  const visibleGroups = useMemo(
    () => filterWardenNavGroups(groups, allowedPermissions ?? createDefaultWardenPermissions()),
    [groups, allowedPermissions],
  );

  return (
    <nav className="flex-1 space-y-4 pb-2 xl:space-y-5">
      {visibleGroups.map((group, groupIndex) => (
        <motion.div
          key={group.id}
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: motionEase, delay: groupIndex * 0.04 }}
        >
          {!collapsed ? (
            <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
              {group.label}
            </p>
          ) : groupIndex > 0 ? (
            <div className="mx-auto mb-2 h-px w-8 bg-white/15" aria-hidden />
          ) : null}
          <ul className="space-y-1">
            {group.items.map((item) => (
              <li key={item.id} data-warden-side-item>
                <SidebarNavLink
                  item={item}
                  collapsed={collapsed}
                  reduceMotion={reduceMotion}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        </motion.div>
      ))}
    </nav>
  );
}
