'use client';

import type { ReactNode } from 'react';

import { RoleAuthSessionProvider } from '@/components/dashboard/role-auth-session-provider';
import { RoleDashboardTopbar } from '@/components/dashboard/role-dashboard-topbar';

type RoleDashboardShellProps = {
  children: ReactNode;
  role: 'HOSTEL_WARDEN' | 'HOSTEL_STAFF';
  title: string;
  subtitle?: string;
  homePath: string;
};

export function RoleDashboardShell({ children, role, title, subtitle, homePath }: RoleDashboardShellProps) {
  return (
    <RoleAuthSessionProvider allowedRoles={[role]} homePath={homePath}>
      <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--muted))]">
        <RoleDashboardTopbar title={title} subtitle={subtitle} />
        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">{children}</div>
        </main>
      </div>
    </RoleAuthSessionProvider>
  );
}
