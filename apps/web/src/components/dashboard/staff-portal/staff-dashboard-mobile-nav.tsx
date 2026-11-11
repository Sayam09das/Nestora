'use client';

import { StaffSidebarPanel } from '@/components/dashboard/staff-portal/staff-sidebar-panel';
import { useStaffShell } from '@/components/dashboard/staff-portal/staff-shell-provider';
import { cn } from '@/lib/utils';

export function StaffDashboardMobileNav() {
  const { mobileNavOpen, setMobileNavOpen } = useStaffShell();

  if (!mobileNavOpen) return null;

  return (
    <div className="fixed inset-0 z-40 md:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close navigation"
        onClick={() => setMobileNavOpen(false)}
      />
      <div
        className={cn(
          'absolute inset-y-0 left-0 w-[min(18rem,88vw)] bg-[linear-gradient(180deg,var(--nestora-forest)_0%,#051f18_100%)] text-white shadow-xl',
        )}
      >
        <StaffSidebarPanel collapsed={false} onNavigate={() => setMobileNavOpen(false)} />
      </div>
    </div>
  );
}
