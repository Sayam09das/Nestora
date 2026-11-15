'use client';

import type { ReactNode } from 'react';

import { RoleAuthSessionProvider } from '@/components/dashboard/role-auth-session-provider';
import { StudentDashboardMobileNav } from '@/components/dashboard/student-portal/student-dashboard-mobile-nav';
import { StudentDashboardSidebar } from '@/components/dashboard/student-portal/student-dashboard-sidebar';
import { StudentDashboardTopbar } from '@/components/dashboard/student-portal/student-dashboard-topbar';
import { StudentShellLiveBootstrap } from '@/components/dashboard/student-portal/student-shell-live-bootstrap';
import { StudentShellProvider } from '@/components/dashboard/student-portal/student-shell-provider';
import { StudentTopbarLiveProvider } from '@/components/dashboard/student-portal/student-topbar-live-provider';

export function StudentDashboardShell({ children }: { children: ReactNode }) {
  return (
    <RoleAuthSessionProvider allowedRoles={['STUDENT']} homePath="/student">
      <StudentShellProvider>
        <StudentTopbarLiveProvider>
        <StudentShellLiveBootstrap />
        <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--muted))]">
          <StudentDashboardTopbar />
          <StudentDashboardMobileNav />
          <div className="flex min-h-0 w-full flex-1 overflow-hidden">
            <StudentDashboardSidebar />
            <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
              <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">{children}</div>
            </main>
          </div>
        </div>
        </StudentTopbarLiveProvider>
      </StudentShellProvider>
    </RoleAuthSessionProvider>
  );
}
