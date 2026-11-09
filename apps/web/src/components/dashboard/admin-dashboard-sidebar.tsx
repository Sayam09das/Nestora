'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

import { adminNavGroups } from '@/components/dashboard/admin-nav-items';
import { AdminSidebarAccount } from '@/components/dashboard/admin-sidebar-account';
import { AdminSidebarNav } from '@/components/dashboard/admin-sidebar-nav';
import { useAdminShell } from '@/components/dashboard/admin-shell-provider';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { NESTORA_BRAND_NAME } from '@/components/marketing/navbar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/35';

export function AdminDashboardSidebar() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const { sidebarCollapsed } = useAdminShell();
  const asideRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reduceMotion || !asideRef.current) {
        return;
      }
      gsap.from(asideRef.current.querySelectorAll('[data-admin-side-item]'), {
        opacity: 0,
        x: -14,
        duration: 0.45,
        stagger: 0.05,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: asideRef, dependencies: [reduceMotion, pathname, sidebarCollapsed] },
  );

  return (
    <aside
      ref={asideRef}
      className={cn(
        'relative hidden shrink-0 flex-col overflow-hidden text-white transition-[width] duration-300 ease-out motion-reduce:transition-none',
        'md:flex md:h-[calc(100dvh-3.5rem)] md:max-h-[calc(100dvh-3.5rem)] sm:h-[calc(100dvh-4rem)] sm:max-h-[calc(100dvh-4rem)]',
        'bg-[linear-gradient(180deg,var(--nestora-forest)_0%,#0a3428_55%,#051f18_100%)]',
        sidebarCollapsed ? 'w-[4.25rem]' : 'w-60 xl:w-[17rem]',
      )}
      aria-label="Admin navigation"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12] hero-grid-pattern mix-blend-overlay"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--nestora-gold)_50%,transparent)]"
        aria-hidden
      />

      <div
        className={cn(
          'relative z-10 flex h-full min-h-0 flex-col overflow-hidden py-4',
          sidebarCollapsed ? 'items-center px-2' : 'px-3',
        )}
      >
        <Link
          href="/admin"
          data-admin-side-item
          className={cn(
            'group flex shrink-0 rounded-xl p-2 transition-colors hover:bg-white/[0.06]',
            sidebarCollapsed ? 'justify-center' : 'items-center gap-3',
            focusRing,
          )}
          title={sidebarCollapsed ? `${NESTORA_BRAND_NAME} command` : undefined}
        >
          <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/15 bg-white/10 shadow-sm">
            <Image
              src="/images/nestora-mark.svg"
              alt=""
              width={36}
              height={36}
              className="size-7 object-contain"
              unoptimized
            />
          </span>
          {!sidebarCollapsed ? (
            <span className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
                {NESTORA_BRAND_NAME}
              </span>
              <span className="block text-sm font-semibold tracking-tight">Command</span>
            </span>
          ) : null}
        </Link>

        <ScrollArea className="mt-3 min-h-0 flex-1 overflow-hidden pr-1 [&_[data-slot=scroll-area-viewport]]:max-h-full">
          <AdminSidebarNav groups={adminNavGroups} collapsed={sidebarCollapsed} />
        </ScrollArea>

        <div data-admin-side-item className="shrink-0">
          <AdminSidebarAccount />
        </div>
      </div>
    </aside>
  );
}
