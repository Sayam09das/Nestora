'use client';

import { StudentSidebarPanel } from '@/components/dashboard/student-portal/student-sidebar-panel';
import { useStudentShell } from '@/components/dashboard/student-portal/student-shell-provider';
import { cn } from '@/lib/utils';

export function StudentDashboardMobileNav() {
  const { mobileNavOpen, setMobileNavOpen } = useStudentShell();

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
        <StudentSidebarPanel collapsed={false} onNavigate={() => setMobileNavOpen(false)} />
      </div>
    </div>
  );
}
