'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Building2, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { useWardenShell } from '@/components/dashboard/warden/warden-shell-provider';
import { Button } from '@/components/ui/button';
import { fetchCurrentUser, logout } from '@/lib/api/auth';
import { cn } from '@/lib/utils';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ''}${parts[parts.length - 1]?.[0] ?? ''}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || 'WD';
}

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/35';

export function WardenSidebarAccount() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { sidebarCollapsed, selectedHostelId, assignedHostels } = useWardenShell();
  const [displayName, setDisplayName] = useState('Hostel Warden');

  const hostelLabel =
    assignedHostels.find((h) => h.id === selectedHostelId)?.label ?? assignedHostels[0]?.label ?? 'Assigned hostel';

  useEffect(() => {
    let cancelled = false;
    void fetchCurrentUser().then(({ user }) => {
      if (cancelled || !user) return;
      setDisplayName(`${user.firstName} ${user.lastName}`.trim() || 'Warden');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const initials = getInitials(displayName);

  const handleLogout = useCallback(async () => {
    await logout();
    router.push('/login');
  }, [router]);

  if (sidebarCollapsed) {
    return (
      <div className="mt-auto space-y-2 border-t border-white/10 pt-4">
        <div className="flex justify-center" title={`${displayName} · ${hostelLabel}`}>
          <span
            className="flex size-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-[11px] font-bold text-white"
            aria-hidden
          >
            {initials}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => void handleLogout()}
          className={cn('mx-auto text-white/70 hover:bg-white/10 hover:text-white', focusRing)}
          aria-label="Log out"
        >
          <LogOut className="size-4" aria-hidden />
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      className="mt-auto space-y-3 border-t border-white/10 pt-5"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <p className="px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">Your hostel</p>
      <div
        className={cn(
          'flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-3',
          'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]',
        )}
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--nestora-forest)] text-xs font-bold text-white ring-2 ring-[color-mix(in_oklch,var(--nestora-gold)_40%,transparent)]">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{displayName}</p>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-white/65">
            <Building2 className="size-3 shrink-0 text-[var(--nestora-gold)]" aria-hidden />
            <span className="truncate">{hostelLabel}</span>
          </p>
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        onClick={() => void handleLogout()}
        className={cn(
          'h-10 w-full justify-start gap-2 rounded-xl px-3 text-sm font-semibold text-white/75 hover:bg-white/[0.08] hover:text-white',
          focusRing,
        )}
      >
        <LogOut className="size-4 shrink-0" aria-hidden />
        Logout
      </Button>
    </motion.div>
  );
}
