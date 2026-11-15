'use client';

import type { ReactNode } from 'react';

import { GuardDashboardSidebar } from '@/components/dashboard/guard-portal/guard-dashboard-sidebar';
import { RoleAuthSessionProvider } from '@/components/dashboard/role-auth-session-provider';
import { RoleDashboardTopbar } from '@/components/dashboard/role-dashboard-topbar';

export function GuardDashboardShell({ children }: { children: ReactNode }) {
  return (
    <RoleAuthSessionProvider allowedRoles={['SECURITY_GUARD']} homePath="/guard">
      <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--muted))]">
        <RoleDashboardTopbar title="Security guard" subtitle="Hostel gate & movement console" />
        <div className="flex min-h-0 w-full flex-1 overflow-hidden">
          <GuardDashboardSidebar />
          <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
            <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">{children}</div>
          </main>
        </div>
      </div>
    </RoleAuthSessionProvider>
  );
}