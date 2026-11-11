'use client';

import { StaffSidebarPanel } from '@/components/dashboard/staff-portal/staff-sidebar-panel';
import { useStaffShell } from '@/components/dashboard/staff-portal/staff-shell-provider';
import { cn } from '@/lib/utils';

const sidebarSurfaceClass =
  'bg-[linear-gradient(180deg,var(--nestora-forest)_0%,#0a3428_55%,#051f18_100%)] text-white';

export function StaffDashboardSidebar() {
  const { sidebarCollapsed } = useStaffShell();

  return (
    <aside
      className={cn(
        'relative hidden h-full min-h-0 shrink-0 flex-col overflow-hidden transition-[width] duration-300 ease-out motion-reduce:transition-none md:flex',
        sidebarSurfaceClass,
        sidebarCollapsed ? 'w-[4.25rem]' : 'w-60 xl:w-[17rem]',
      )}
      aria-label="Staff navigation"
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.12] hero-grid-pattern mix-blend-overlay" aria-hidden />
      <StaffSidebarPanel collapsed={sidebarCollapsed} />
    </aside>
  );
}
