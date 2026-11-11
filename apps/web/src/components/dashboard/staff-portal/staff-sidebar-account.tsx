'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { useStaffShell } from '@/components/dashboard/staff-portal/staff-shell-provider';
import { Button } from '@/components/ui/button';
import { fetchCurrentUser, logout } from '@/lib/api/auth';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/35';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ''}${parts[parts.length - 1]?.[0] ?? ''}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || 'ST';
}

export function StaffSidebarAccount() {
  const router = useRouter();
  const { sidebarCollapsed } = useStaffShell();
  const [displayName, setDisplayName] = useState('Hostel Staff');

  useEffect(() => {
    let cancelled = false;
    void fetchCurrentUser().then(({ user }) => {
      if (cancelled || !user) return;
      setDisplayName(`${user.firstName} ${user.lastName}`.trim() || 'Staff');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const onLogout = useCallback(async () => {
    await logout();
    router.replace('/login');
  }, [router]);

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-2',
        sidebarCollapsed && 'flex-col',
      )}
    >
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/15 text-xs font-bold text-white"
        aria-hidden
      >
        {getInitials(displayName)}
      </span>
      {!sidebarCollapsed ? (
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{displayName}</p>
          <p className="truncate text-[10px] text-white/50">Hostel Staff</p>
        </div>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn('size-8 shrink-0 text-white/80 hover:bg-white/10 hover:text-white', focusRing)}
        onClick={() => void onLogout()}
        aria-label="Sign out"
      >
        <LogOut className="size-4" aria-hidden />
      </Button>
    </div>
  );
}
