'use client';

import { usePathname } from 'next/navigation';
import { useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

import { WardenSidebarPanel } from '@/components/dashboard/warden/warden-sidebar-panel';
import { useWardenShell } from '@/components/dashboard/warden/warden-shell-provider';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { cn } from '@/lib/utils';

const sidebarSurfaceClass =
  'bg-[linear-gradient(180deg,var(--nestora-forest)_0%,#0a3428_55%,#051f18_100%)] text-white';

export function WardenDashboardSidebar() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const { sidebarCollapsed } = useWardenShell();
  const asideRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reduceMotion || !asideRef.current) return;
      gsap.from(asideRef.current.querySelectorAll('[data-warden-side-item]'), {
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
        'relative hidden h-full min-h-0 shrink-0 flex-col overflow-hidden transition-[width] duration-300 ease-out motion-reduce:transition-none md:flex',
        sidebarSurfaceClass,
        sidebarCollapsed ? 'w-[4.25rem]' : 'w-60 xl:w-[17rem]',
      )}
      aria-label="Warden navigation"
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.12] hero-grid-pattern mix-blend-overlay" aria-hidden />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--nestora-gold)_50%,transparent)]"
        aria-hidden
      />
      <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <WardenSidebarPanel collapsed={sidebarCollapsed} />
      </div>
    </aside>
  );
}
