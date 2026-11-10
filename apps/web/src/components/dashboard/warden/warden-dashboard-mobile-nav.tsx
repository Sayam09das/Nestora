'use client';

import { usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { WardenSidebarPanel } from '@/components/dashboard/warden/warden-sidebar-panel';
import { useWardenShell } from '@/components/dashboard/warden/warden-shell-provider';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const sidebarSurfaceClass =
  'bg-[linear-gradient(180deg,var(--nestora-forest)_0%,#0a3428_55%,#051f18_100%)] text-white';

function Chrome({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 opacity-[0.12] hero-grid-pattern mix-blend-overlay" aria-hidden />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--nestora-gold)_50%,transparent)]"
        aria-hidden
      />
      {children}
    </>
  );
}

export function WardenDashboardMobileNav() {
  const pathname = usePathname();
  const { mobileNavOpen, setMobileNavOpen } = useWardenShell();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname, setMobileNavOpen]);

  return (
    <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
      <SheetContent side="left" className={cn('w-[min(100vw-2rem,18rem)] border-0 p-0', sidebarSurfaceClass)}>
        <Chrome>
          <WardenSidebarPanel collapsed={false} onNavigate={() => setMobileNavOpen(false)} className="h-full" />
        </Chrome>
      </SheetContent>
    </Sheet>
  );
}
