'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Activity, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef } from 'react';

import { AuthSkiperLink } from '@/components/auth/auth-skiper-link';
import { adminNavItems } from '@/components/dashboard/admin-nav-items';
import { useAdminShell } from '@/components/dashboard/admin-shell-provider';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { NESTORA_BRAND_NAME } from '@/components/marketing/navbar';
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
        stagger: 0.07,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: asideRef, dependencies: [reduceMotion, pathname] },
  );

  return (
    <aside
      ref={asideRef}
      className={cn(
        'relative hidden shrink-0 flex-col text-white transition-[width] duration-300 ease-out motion-reduce:transition-none',
        'md:sticky md:top-14 md:flex md:min-h-[calc(100dvh-3.5rem)] md:self-start sm:top-16 sm:min-h-[calc(100dvh-4rem)]',
        'bg-[linear-gradient(180deg,var(--nestora-forest)_0%,#0a3428_55%,#051f18_100%)]',
        sidebarCollapsed ? 'w-[4.25rem] md:w-[4.25rem]' : 'w-[min(100%,17.5rem)]',
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
          'relative z-10 flex flex-1 flex-col py-6',
          sidebarCollapsed ? 'items-center px-2' : 'px-4 xl:px-5',
        )}
      >
        <Link
          href="/admin"
          data-admin-side-item
          className={cn(
            'group flex rounded-xl p-2 transition-colors hover:bg-white/[0.06]',
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

        {!sidebarCollapsed ? (
          <p
            data-admin-side-item
            className="mt-6 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45"
          >
            Workspace
          </p>
        ) : null}

        <nav className="mt-2 flex-1">
          <ul className="space-y-1">
            {adminNavItems.map((item) => {
              const active = item.isActive(pathname);
              const Icon = item.icon;
              return (
                <li key={item.href} data-admin-side-item>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={cn(
                      'group relative flex rounded-xl transition-colors duration-200',
                      sidebarCollapsed
                        ? 'items-center justify-center px-2 py-2.5'
                        : 'items-start gap-3 px-3 py-2.5',
                      active ? 'bg-white/[0.1] text-white' : 'text-white/75 hover:bg-white/[0.06] hover:text-white',
                      focusRing,
                    )}
                  >
                    {active && !reduceMotion ? (
                      <motion.span
                        layoutId="admin-sidebar-active"
                        className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-[var(--nestora-gold)]"
                        transition={{ type: 'spring', stiffness: 520, damping: 34 }}
                        aria-hidden
                      />
                    ) : active ? (
                      <span
                        className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-[var(--nestora-gold)]"
                        aria-hidden
                      />
                    ) : null}
                    <span
                      className={cn(
                        'flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors',
                        !sidebarCollapsed && 'ml-1',
                        active
                          ? 'border-[color-mix(in_oklch,var(--nestora-gold)_35%,white)] bg-white/10'
                          : 'border-white/10 bg-white/[0.04] group-hover:border-white/20',
                      )}
                    >
                      <Icon
                        className={cn(
                          'size-4',
                          active ? 'text-[var(--nestora-gold)]' : 'text-white/80',
                        )}
                        aria-hidden
                      />
                    </span>
                    {!sidebarCollapsed ? (
                      <span className="min-w-0 pt-0.5">
                        <span className="block text-sm font-semibold leading-none">{item.label}</span>
                        <span className="mt-1 block text-[11px] leading-snug text-white/55 group-hover:text-white/65">
                          {item.description}
                        </span>
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {!sidebarCollapsed ? (
        <div
          data-admin-side-item
          className="mt-6 space-y-3 border-t border-white/10 pt-5"
        >
          <span className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/80">
            <span className="relative flex size-2 shrink-0" aria-hidden>
              {!reduceMotion ? (
                <motion.span
                  className="absolute inset-0 rounded-full bg-[var(--nestora-gold)]"
                  animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.12, 1] }}
                  transition={{ duration: 2.4, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                />
              ) : (
                <span className="absolute inset-0 rounded-full bg-[var(--nestora-gold)]" />
              )}
            </span>
            Systems nominal
          </span>

          <p className="flex items-center gap-1.5 px-1 text-[11px] text-white/55">
            <ShieldCheck className="size-3.5 shrink-0 text-[var(--nestora-gold)]" aria-hidden />
            Privileged session · FR-002
          </p>

          <AuthSkiperLink
            href="/login"
            className="px-1 text-[11px] font-semibold text-white/70 hover:text-white"
          >
            Institutional sign-in
          </AuthSkiperLink>

          <p className="flex items-center gap-1.5 px-1 text-[10px] text-white/45">
            <Activity className="size-3" aria-hidden />
            Audit-backed actions only
          </p>
        </div>
        ) : (
          <div className="mt-auto flex justify-center pt-4" title="Systems nominal">
            <span className="relative flex size-2.5" aria-hidden>
              {!reduceMotion ? (
                <motion.span
                  className="absolute inset-0 rounded-full bg-[var(--nestora-gold)]"
                  animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.12, 1] }}
                  transition={{ duration: 2.4, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                />
              ) : (
                <span className="absolute inset-0 rounded-full bg-[var(--nestora-gold)]" />
              )}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
