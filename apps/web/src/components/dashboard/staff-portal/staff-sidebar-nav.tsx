'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import {
  filterStaffNavGroups,
  staffNavGroups,
  type StaffNavLink,
} from '@/components/dashboard/staff-portal/staff-nav-items';
import { useStaffShell } from '@/components/dashboard/staff-portal/staff-shell-provider';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/35';

type Props = {
  collapsed: boolean;
  onNavigate?: () => void;
};

function StaffNavItem({ item, collapsed, onNavigate }: { item: StaffNavLink; collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = item.isActive(pathname);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      data-staff-side-item
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={cn(
        'group flex rounded-xl transition-colors',
        collapsed ? 'justify-center p-2.5' : 'items-center gap-3 px-3 py-2.5',
        active ? 'bg-white/12 text-white' : 'text-white/75 hover:bg-white/[0.06] hover:text-white',
        focusRing,
      )}
    >
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors',
          active ? 'border-white/25 bg-white/10' : 'border-white/10 bg-white/[0.04] group-hover:border-white/20',
        )}
      >
        <Icon className="size-4" aria-hidden />
      </span>
      {!collapsed ? (
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">{item.label}</span>
          {item.description ? (
            <span className="block truncate text-[11px] text-white/50">{item.description}</span>
          ) : null}
        </span>
      ) : null}
    </Link>
  );
}

export function StaffSidebarNav({ collapsed, onNavigate }: Props) {
  const { navPermissions } = useStaffShell();
  const groups = useMemo(() => filterStaffNavGroups(staffNavGroups, navPermissions), [navPermissions]);

  return (
    <nav className="space-y-6" aria-label="Staff portal">
      {groups.map((group) => (
        <div key={group.id}>
          {!collapsed ? (
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">{group.label}</p>
          ) : null}
          <ul className="space-y-1">
            {group.items.map((item) => (
              <li key={item.id}>
                <StaffNavItem item={item} collapsed={collapsed} onNavigate={onNavigate} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
