import type { ReactNode } from 'react';

import { AdminDashboardHeader } from '@/components/dashboard/admin-dashboard-header';

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--muted))]">
      <AdminDashboardHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
