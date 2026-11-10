'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ChevronRight, Moon, PanelLeft, Search, Sun } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

import { getWardenRouteMeta } from '@/components/dashboard/warden/warden-route-meta';
import { useWardenShell } from '@/components/dashboard/warden/warden-shell-provider';
import { WardenNotificationsPanel } from '@/components/dashboard/warden/warden-notifications-panel';
import { WardenProfileMenu } from '@/components/dashboard/warden/warden-profile-menu';
import { WardenTopbarGlobalSearch } from '@/components/dashboard/warden/warden-topbar-global-search';
import { WardenTopbarHelpMenu } from '@/components/dashboard/warden/warden-topbar-help-menu';
import { WardenTopbarHostelSelector } from '@/components/dashboard/warden/warden-topbar-hostel-selector';
import { WardenTopbarMessagesPanel } from '@/components/dashboard/warden/warden-topbar-messages-panel';
import { WardenTopbarQuickActions } from '@/components/dashboard/warden/warden-topbar-quick-actions';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

function WardenThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return <button type="button" className="size-9 opacity-0" aria-hidden tabIndex={-1} />;
  }
  const dark = resolvedTheme === 'dark';
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-full border border-[var(--nestora-sage-muted)] bg-card text-[var(--nestora-forest)] hover:bg-muted/80',
        focusRing,
      )}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
    </button>
  );
}

function TopbarDivider() {
  return <div className="mx-0.5 hidden h-6 w-px bg-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] lg:block" aria-hidden />;
}

export function WardenDashboardTopbar() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const { sidebarCollapsed, toggleSidebar, toggleMobileNav, mobileNavOpen } = useWardenShell();
  const headerRef = useRef<HTMLElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);
  const { title, breadcrumbs } = getWardenRouteMeta(pathname);
  const [searchOpen, setSearchOpen] = useState(false);

  useGSAP(
    () => {
      if (reduceMotion || !headerRef.current) return;
      gsap.from(headerRef.current.querySelector('[data-warden-accent]'), {
        scaleX: 0,
        duration: 0.55,
        ease: 'power2.inOut',
        transformOrigin: 'left center',
        clearProps: 'transform',
      });
    },
    { scope: headerRef, dependencies: [reduceMotion] },
  );

  useGSAP(
    () => {
      if (reduceMotion || !toolsRef.current) return;
      gsap.from(toolsRef.current.querySelectorAll('[data-warden-topbar-item]'), {
        opacity: 0,
        y: 10,
        duration: 0.38,
        stagger: { each: 0.05, from: 'end' },
        ease: 'back.out(1.25)',
        clearProps: 'opacity,transform',
      });
    },
    { scope: toolsRef, dependencies: [reduceMotion, pathname] },
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleSidebarToggle = () => {
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    if (isMobile) toggleMobileNav();
    else toggleSidebar();
  };

  return (
    <>
      <header
        ref={headerRef}
        className="z-50 shrink-0 border-b border-[var(--nestora-sage-muted)] bg-[color-mix(in_oklch,var(--background)_92%,transparent)] backdrop-blur-xl supports-[backdrop-filter]:bg-[color-mix(in_oklch,var(--background)_78%,transparent)]"
      >
        <div
          data-warden-accent
          className="h-0.5 w-full bg-[linear-gradient(90deg,var(--nestora-gold)_0%,var(--nestora-sage)_50%,var(--nestora-forest)_100%)]"
          aria-hidden
        />

        <div className="flex h-14 min-h-14 w-full items-center gap-2 px-3 sm:h-16 sm:gap-2.5 sm:px-4 lg:px-5">
          <motion.button
            type="button"
            data-warden-topbar-item
            onClick={handleSidebarToggle}
            className={cn(
              'inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-[var(--nestora-sage-muted)] bg-card text-[var(--nestora-forest)] shadow-sm hover:bg-muted/80',
              focusRing,
            )}
            whileTap={reduceMotion ? undefined : { scale: 0.94 }}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={mobileNavOpen || !sidebarCollapsed}
          >
            <PanelLeft className="size-4" aria-hidden />
          </motion.button>

          <div data-warden-topbar-item className="flex min-w-0 flex-1 flex-col justify-center sm:max-w-[38%] lg:max-w-[22rem]">
            <h1 className="sr-only">{title}</h1>
            <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-[11px] sm:text-xs">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <span key={crumb.href} className="inline-flex min-w-0 items-center gap-1">
                    {index > 0 ? <ChevronRight className="size-3 shrink-0 text-muted-foreground/60" aria-hidden /> : null}
                    {isLast ? (
                      <span className="truncate font-semibold text-[var(--nestora-forest)]" aria-current="page">
                        {crumb.label}
                      </span>
                    ) : (
                      <Link href={crumb.href} className={cn('truncate text-muted-foreground hover:text-foreground', focusRing)}>
                        {crumb.label}
                      </Link>
                    )}
                  </span>
                );
              })}
            </nav>
          </div>

          <div data-warden-topbar-item className="hidden shrink-0 md:block">
            <WardenTopbarHostelSelector compact className="h-9" />
          </div>

          <div data-warden-topbar-item className="hidden min-w-0 flex-1 lg:flex lg:max-w-xl">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className={cn(
                'flex h-9 w-full items-center gap-2 rounded-full border border-[var(--nestora-sage-muted)]',
                'bg-[color-mix(in_oklch,var(--nestora-cream)_10%,var(--card))] px-3.5 text-left text-caption text-muted-foreground shadow-sm',
                'hover:border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] hover:shadow-md',
                focusRing,
              )}
            >
              <Search className="size-3.5 shrink-0 text-[var(--nestora-sage)]" aria-hidden />
              <span className="truncate">Search students, rooms, complaints…</span>
              <kbd className="ml-auto hidden rounded-md border border-border bg-muted/80 px-1.5 py-0.5 font-mono text-[10px] xl:inline">⌘K</kbd>
            </button>
          </div>

          <button
            type="button"
            data-warden-topbar-item
            onClick={() => setSearchOpen(true)}
            className={cn(
              'inline-flex size-9 shrink-0 items-center justify-center rounded-full border bg-card text-[var(--nestora-forest)] lg:hidden',
              focusRing,
            )}
            aria-label="Open global search"
          >
            <Search className="size-4" aria-hidden />
          </button>

          <div
            ref={toolsRef}
            className="ml-auto flex shrink-0 items-center gap-1 rounded-full border border-[color-mix(in_oklch,var(--nestora-sage)_12%,var(--border))] bg-[color-mix(in_oklch,var(--card)_88%,transparent)] p-1 pl-1.5 shadow-sm sm:gap-1.5 sm:p-1.5"
          >
            <div data-warden-topbar-item className="md:hidden">
              <WardenTopbarHostelSelector iconOnly className="border-[var(--nestora-sage-muted)] bg-card" />
            </div>
            <div data-warden-topbar-item>
              <WardenTopbarQuickActions />
            </div>
            <TopbarDivider />
            <div data-warden-topbar-item>
              <WardenNotificationsPanel />
            </div>
            <div data-warden-topbar-item>
              <WardenTopbarMessagesPanel />
            </div>
            <div data-warden-topbar-item>
              <WardenTopbarHelpMenu />
            </div>
            <TopbarDivider />
            <div data-warden-topbar-item>
              <WardenThemeToggle />
            </div>
            <div data-warden-topbar-item>
              <WardenProfileMenu className="border-0 bg-transparent shadow-none hover:shadow-none" />
            </div>
          </div>
        </div>
      </header>

      <WardenTopbarGlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
