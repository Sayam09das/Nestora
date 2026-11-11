'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, type ReactNode } from 'react';

import {
  filterStudentNavGroups,
  studentNavGroups,
  type StudentNavLink,
} from '@/components/dashboard/student-portal/student-nav-items';
import type { StudentNavBadgeKey } from '@/components/dashboard/student-portal/student-nav-permissions';
import { useStudentShell } from '@/components/dashboard/student-portal/student-shell-provider';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/35';

const motionEase = [0.22, 1, 0.36, 1] as const;

type Props = { collapsed: boolean; onNavigate?: () => void };

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
        'relative flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors',
        active ? 'border-white/25 bg-white/10' : 'border-white/10 bg-white/[0.04] group-hover:border-white/20',
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
  badgeCount,
  onNavigate,
}: {
  item: StudentNavLink;
  collapsed: boolean;
  reduceMotion: boolean | null;
  badgeCount: number;
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
          layoutId="student-sidebar-active"
          className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-[var(--nestora-gold)]"
          transition={{ type: 'spring', stiffness: 520, damping: 34 }}
          aria-hidden
        />
      ) : active ? (
        <span className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-[var(--nestora-gold)]" aria-hidden />
      ) : null}

      <NavIconButton active={active} className={!collapsed ? 'ml-1' : undefined}>
        <Icon className={cn('size-4', active ? 'text-[var(--nestora-gold)]' : 'text-white/80')} aria-hidden />
        {collapsed && badgeCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-[var(--nestora-gold)]" aria-hidden />
        ) : null}
      </NavIconButton>

      {!collapsed ? (
        <span className="min-w-0 flex-1 pt-0.5">
          <span className="flex items-center gap-2">
            <span className="block text-sm font-semibold leading-none">{item.label}</span>
            {badgeCount > 0 ? (
              <span
                className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-[var(--nestora-gold)] px-1.5 py-0.5 text-[9px] font-bold leading-none text-[var(--nestora-forest)]"
                aria-label={`${badgeCount} pending updates`}
              >
                {badgeCount > 9 ? '9+' : badgeCount}
              </span>
            ) : null}
          </span>
          {item.description ? (
            <span className="mt-1 hidden text-[11px] leading-snug text-white/55 xl:block">{item.description}</span>
          ) : null}
        </span>
      ) : null}
    </Link>
  );
}

export function StudentSidebarNav({ collapsed, onNavigate }: Props) {
  const reduceMotion = useReducedMotion();
  const { navPermissions, navBadges } = useStudentShell();
  const groups = useMemo(() => filterStudentNavGroups(studentNavGroups, navPermissions), [navPermissions]);

  const badgeFor = (key?: StudentNavBadgeKey) => (key ? (navBadges[key] ?? 0) : 0);

  return (
    <nav className="flex-1 space-y-4 pb-2 xl:space-y-5" aria-label="Student portal">
      {groups.map((group, groupIndex) => (
        <motion.div
          key={group.id}
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: groupIndex * 0.04, duration: 0.32, ease: motionEase }}
        >
          {!collapsed ? (
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">{group.label}</p>
          ) : null}
          <ul className="space-y-1">
            {group.items.map((item) => (
              <li key={item.id}>
                <SidebarNavLink
                  item={item}
                  collapsed={collapsed}
                  reduceMotion={reduceMotion}
                  badgeCount={badgeFor(item.badgeKey)}
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
