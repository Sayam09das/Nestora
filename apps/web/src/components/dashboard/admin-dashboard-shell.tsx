'use client';

import type { ReactNode } from 'react';

import { AdminDashboardSidebar } from '@/components/dashboard/admin-dashboard-sidebar';
import { AdminDashboardTopbar } from '@/components/dashboard/admin-dashboard-topbar';
import { AdminShellProvider } from '@/components/dashboard/admin-shell-provider';

export function AdminDashboardShell({ children }: { children: ReactNode }) {
  return (
    <AdminShellProvider>
      <div className="min-h-screen bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--muted))]">
        <AdminDashboardTopbar />
        <div className="mx-auto flex w-full max-w-7xl">
          <AdminDashboardSidebar />
          <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">{children}</main>
        </div>
      </div>
    </AdminShellProvider>
  );
}
