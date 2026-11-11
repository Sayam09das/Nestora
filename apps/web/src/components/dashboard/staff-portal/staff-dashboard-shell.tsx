'use client';

import type { ReactNode } from 'react';

import { RoleAuthSessionProvider } from '@/components/dashboard/role-auth-session-provider';
import { StaffDashboardMobileNav } from '@/components/dashboard/staff-portal/staff-dashboard-mobile-nav';
import { StaffDashboardSidebar } from '@/components/dashboard/staff-portal/staff-dashboard-sidebar';
import { StaffDashboardTopbar } from '@/components/dashboard/staff-portal/staff-dashboard-topbar';
import { StaffShellProvider } from '@/components/dashboard/staff-portal/staff-shell-provider';

export function StaffDashboardShell({ children }: { children: ReactNode }) {
  return (
    <RoleAuthSessionProvider allowedRoles={['HOSTEL_STAFF']} homePath="/staff">
      <StaffShellProvider>
        <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--muted))]">
          <StaffDashboardTopbar />
          <StaffDashboardMobileNav />
          <div className="flex min-h-0 w-full flex-1 overflow-hidden">
            <StaffDashboardSidebar />
            <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
              <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">{children}</div>
            </main>
          </div>
        </div>
      </StaffShellProvider>
    </RoleAuthSessionProvider>
  );
}
