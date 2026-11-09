'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, FileText, LayoutDashboard, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef } from 'react';

import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { NESTORA_BRAND_NAME } from '@/components/marketing/navbar';
import { cn } from '@/lib/utils';

const navEase = [0.22, 1, 0.36, 1] as const;

const adminNavItems = [
  {
    href: '/admin',
    label: 'Overview',
    icon: LayoutDashboard,
    isActive: (pathname: string) => pathname === '/admin',
  },
  {
    href: '/admin/audit-logs',
    label: 'Audit logs',
    icon: FileText,
    isActive: (pathname: string) => pathname.startsWith('/admin/audit-logs'),
  },
] as const;

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

export function AdminDashboardHeader() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const headerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reduceMotion || !headerRef.current) {
        return;
      }
      gsap.from(headerRef.current.querySelector('[data-admin-dash-accent]'), {
        scaleX: 0,
        duration: 0.55,
        ease: 'power2.inOut',
        transformOrigin: 'left center',
      });
    },
    { scope: headerRef, dependencies: [reduceMotion] },
  );

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-[var(--nestora-sage-muted)] bg-[color-mix(in_oklch,var(--background)_92%,transparent)] shadow-[0_1px_0_0_color-mix(in_srgb,var(--foreground)_4%,transparent)] backdrop-blur-xl supports-[backdrop-filter]:bg-[color-mix(in_oklch,var(--background)_78%,transparent)]"
    >
      <div
        data-admin-dash-accent
        className="h-0.5 w-full bg-[linear-gradient(90deg,var(--nestora-forest)_0%,var(--nestora-gold)_50%,var(--nestora-forest)_100%)]"
        aria-hidden
      />
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-8">
          <Link
            href="/admin"
            className={cn(
              'group flex min-w-0 shrink-0 items-center gap-2.5 rounded-lg',
              focusRing,
            )}
          >
            <span className="relative flex size-9 items-center justify-center overflow-hidden rounded-lg border border-[var(--nestora-sage-muted)] bg-card shadow-sm transition-[border-color,box-shadow] duration-200 group-hover:border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] group-hover:shadow-md">
              <Image
                src="/images/nestora-mark.svg"
                alt=""
                width={32}
                height={32}
                className="size-6 object-contain"
                unoptimized
              />
            </span>
            <span className="min-w-0 hidden sm:block">
              <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                {NESTORA_BRAND_NAME}
              </span>
              <span className="block truncate text-sm font-semibold tracking-tight text-[var(--nestora-forest)]">
                Admin console
              </span>
            </span>
          </Link>

          <nav aria-label="Admin" className="min-w-0 flex-1">
            <ul className="flex items-center gap-0.5 sm:gap-1">
              {adminNavItems.map((item) => {
                const active = item.isActive(pathname);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'group relative inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-caption font-semibold sm:px-3.5',
                        'transition-colors duration-200',
                        active
                          ? 'bg-[color-mix(in_oklch,var(--nestora-forest)_10%,var(--muted))] text-[var(--nestora-forest)]'
                          : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                        focusRing,
                      )}
                    >
                      <Icon className="size-3.5 shrink-0 opacity-80" aria-hidden />
                      <span className="truncate">{item.label}</span>
                      {active && !reduceMotion ? (
                        <motion.span
                          layoutId="admin-dash-nav-pill"
                          className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-[color-mix(in_oklch,var(--nestora-sage)_28%,transparent)]"
                          transition={{ type: 'spring', stiffness: 480, damping: 34 }}
                          aria-hidden
                        />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="hidden items-center gap-1.5 rounded-full border border-[var(--nestora-sage-muted)] bg-[color-mix(in_oklch,var(--nestora-cream)_40%,var(--card))] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--nestora-forest)] md:inline-flex">
            <ShieldCheck className="size-3 text-[var(--nestora-sage)]" aria-hidden />
            FR-002
          </span>
          <motion.div whileHover={reduceMotion ? undefined : { y: -1 }} whileTap={reduceMotion ? undefined : { scale: 0.98 }}>
            <Link
              href="/"
              className={cn(
                'inline-flex h-9 items-center gap-1.5 rounded-full border border-transparent px-3 text-caption font-semibold',
                'bg-[var(--nestora-forest)] text-white transition-colors duration-200',
                'hover:bg-[color-mix(in_oklch,var(--nestora-forest),white_12%)]',
                focusRing,
              )}
            >
              <span className="hidden sm:inline">Marketing site</span>
              <span className="sm:hidden">Home</span>
              <ArrowUpRight className="size-3.5 shrink-0" aria-hidden strokeWidth={2.25} />
            </Link>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
