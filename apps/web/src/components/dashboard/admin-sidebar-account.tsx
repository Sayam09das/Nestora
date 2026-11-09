'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

import { AuthSkiperLink } from '@/components/auth/auth-skiper-link';
import { useAdminShell } from '@/components/dashboard/admin-shell-provider';
import { fetchCurrentUser } from '@/lib/api/auth';
import { cn } from '@/lib/utils';

function formatRole(role: string): string {
  switch (role) {
    case 'UNIVERSITY_ADMINISTRATOR':
      return 'Super Administrator';
    default:
      return role
        .toLowerCase()
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
  }
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ''}${parts[parts.length - 1]?.[0] ?? ''}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || 'SA';
}

export function AdminSidebarAccount() {
  const reduceMotion = useReducedMotion();
  const { sidebarCollapsed } = useAdminShell();
  const [displayName, setDisplayName] = useState('Admin');
  const [roleLabel, setRoleLabel] = useState('Super Administrator');

  useEffect(() => {
    let cancelled = false;
    void fetchCurrentUser().then(({ user }) => {
      if (cancelled || !user) {
        return;
      }
      const name = `${user.firstName} ${user.lastName}`.trim() || 'Administrator';
      setDisplayName(name);
      setRoleLabel(formatRole(user.role));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const initials = getInitials(displayName);

  if (sidebarCollapsed) {
    return (
      <div
        className="mt-auto flex justify-center border-t border-white/10 pt-4"
        title={`${displayName} · ${roleLabel}`}
      >
        <span
          className="flex size-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-[11px] font-bold text-white"
          aria-hidden
        >
          {initials}
        </span>
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
      <p className="px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">Admin Account</p>
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
            <ShieldCheck className="size-3 shrink-0 text-[var(--nestora-gold)]" aria-hidden />
            <span className="truncate">{roleLabel}</span>
          </p>
        </div>
      </div>

      <AuthSkiperLink
        href="/login"
        className="block px-2 text-[11px] font-semibold text-white/60 hover:text-white"
      >
        Switch institutional account
      </AuthSkiperLink>
    </motion.div>
  );
}
