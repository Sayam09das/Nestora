'use client';

import type { ReactNode } from 'react';

import { AdminDashboardMobileNav } from '@/components/dashboard/admin-dashboard-mobile-nav';
import { AdminDashboardSidebar } from '@/components/dashboard/admin-dashboard-sidebar';
import { AdminDashboardTopbar } from '@/components/dashboard/admin-dashboard-topbar';
import { AdminShellProvider } from '@/components/dashboard/admin-shell-provider';

export function AdminDashboardShell({ children }: { children: ReactNode }) {
  return (
    <AdminShellProvider>
      <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--muted))]">
        <AdminDashboardTopbar />
        <AdminDashboardMobileNav />
        <div className="flex min-h-0 w-full flex-1 overflow-hidden">
          <AdminDashboardSidebar />
          <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
            <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminShellProvider>
  );
}
