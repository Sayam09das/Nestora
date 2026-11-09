'use client';

import type { ReactNode } from 'react';

import { AdminDashboardMobileNav } from '@/components/dashboard/admin-dashboard-mobile-nav';
import { AdminDashboardSidebar } from '@/components/dashboard/admin-dashboard-sidebar';
import { AdminDashboardTopbar } from '@/components/dashboard/admin-dashboard-topbar';
import { AdminShellProvider } from '@/components/dashboard/admin-shell-provider';

export function AdminDashboardShell({ children }: { children: ReactNode }) {
  return (
    <AdminShellProvider>
      <div className="flex min-h-dvh flex-col bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--muted))]">
        <AdminDashboardTopbar />
        <AdminDashboardMobileNav />
        <div className="flex min-h-0 w-full flex-1">
          <AdminDashboardSidebar />
          <main className="min-w-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminShellProvider>
  );
}
