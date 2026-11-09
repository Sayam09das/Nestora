'use client';

import { usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { AdminSidebarPanel } from '@/components/dashboard/admin-sidebar-panel';
import { useAdminShell } from '@/components/dashboard/admin-shell-provider';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const sidebarSurfaceClass =
  'bg-[linear-gradient(180deg,var(--nestora-forest)_0%,#0a3428_55%,#051f18_100%)] text-white';

function AdminSidebarChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12] hero-grid-pattern mix-blend-overlay"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--nestora-gold)_50%,transparent)]"
        aria-hidden
      />
      {children}
    </>
  );
}

/** Mobile-only navigation drawer — portaled at shell root. */
export function AdminDashboardMobileNav() {
  const pathname = usePathname();
  const { mobileNavOpen, setMobileNavOpen } = useAdminShell();
  const closeMobileNav = () => setMobileNavOpen(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname, setMobileNavOpen]);

  return (
    <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
      <SheetContent
        side="left"
        showCloseButton
        className={cn(
          'flex h-dvh max-h-dvh w-[min(18.5rem,85vw)] max-w-[85vw] flex-col border-0 p-0 shadow-2xl md:hidden',
          'data-[side=left]:w-[min(18.5rem,85vw)]',
          sidebarSurfaceClass,
          '[&_[data-slot=sheet-close]]:z-20 [&_[data-slot=sheet-close]]:text-white [&_[data-slot=sheet-close]]:hover:bg-white/10',
        )}
      >
        <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
          <AdminSidebarChrome>
            <AdminSidebarPanel collapsed={false} onNavigate={closeMobileNav} className="h-full min-h-0" />
          </AdminSidebarChrome>
        </div>
      </SheetContent>
    </Sheet>
  );
}
