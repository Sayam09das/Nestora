'use client';

import type { ReactNode } from 'react';

import { RoleAuthSessionProvider } from '@/components/dashboard/role-auth-session-provider';
import { WardenDashboardMobileNav } from '@/components/dashboard/warden/warden-dashboard-mobile-nav';
import { WardenDashboardSidebar } from '@/components/dashboard/warden/warden-dashboard-sidebar';
import { WardenDashboardTopbar } from '@/components/dashboard/warden/warden-dashboard-topbar';
import { WardenShellProvider } from '@/components/dashboard/warden/warden-shell-provider';

export function WardenDashboardShell({ children }: { children: ReactNode }) {
  return (
    <RoleAuthSessionProvider allowedRoles={['HOSTEL_WARDEN']} homePath="/warden">
      <WardenShellProvider>
        <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--muted))]">
          <WardenDashboardTopbar />
          <WardenDashboardMobileNav />
          <div className="flex min-h-0 w-full flex-1 overflow-hidden">
            <WardenDashboardSidebar />
            <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
              <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">{children}</div>
            </main>
          </div>
        </div>
      </WardenShellProvider>
    </RoleAuthSessionProvider>
  );
}
