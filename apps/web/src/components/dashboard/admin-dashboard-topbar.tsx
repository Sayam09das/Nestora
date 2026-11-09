'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ChevronRight, Moon, PanelLeft, Search, Sun } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

import { flattenAdminNavLinks } from '@/components/dashboard/admin-nav-items';
import { AdminNotificationsPanel } from '@/components/dashboard/admin-notifications-panel';
import { AdminProfileMenu } from '@/components/dashboard/admin-profile-menu';
import { getAdminRouteMeta } from '@/components/dashboard/admin-route-meta';
import { useAdminShell } from '@/components/dashboard/admin-shell-provider';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

const globalSearchItems = flattenAdminNavLinks();

function AdminThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button
        type="button"
        className="inline-flex size-9 items-center justify-center rounded-full border border-[var(--nestora-sage-muted)] bg-card opacity-0"
        aria-hidden
        tabIndex={-1}
      />
    );
  }

  const dark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-full border border-[var(--nestora-sage-muted)] bg-card text-[var(--nestora-forest)]',
        'transition-colors hover:bg-muted/80',
        focusRing,
      )}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
    </button>
  );
}

export function AdminDashboardTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { sidebarCollapsed, toggleSidebar } = useAdminShell();
  const headerRef = useRef<HTMLElement>(null);
  const { title, breadcrumbs } = getAdminRouteMeta(pathname);

  const [searchOpen, setSearchOpen] = useState(false);

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

  return (
    <>
      <header
        ref={headerRef}
        className="sticky top-0 z-50 border-b border-[var(--nestora-sage-muted)] bg-[color-mix(in_oklch,var(--background)_92%,transparent)] backdrop-blur-xl supports-[backdrop-filter]:bg-[color-mix(in_oklch,var(--background)_78%,transparent)]"
      >
        <div
          data-admin-dash-accent
          className="h-0.5 w-full bg-[linear-gradient(90deg,var(--nestora-forest)_0%,var(--nestora-gold)_50%,var(--nestora-forest)_100%)]"
          aria-hidden
        />

        <div className="mx-auto flex h-auto min-h-14 max-w-7xl flex-wrap items-center gap-2 px-4 py-2 sm:min-h-16 sm:gap-3 sm:px-6">
          {/* 1. Sidebar toggle */}
          <motion.button
            type="button"
            onClick={toggleSidebar}
            className={cn(
              'hidden size-9 shrink-0 items-center justify-center rounded-full border border-[var(--nestora-sage-muted)] bg-card text-[var(--nestora-forest)] md:inline-flex',
              'hover:bg-muted/80',
              focusRing,
            )}
            whileTap={reduceMotion ? undefined : { scale: 0.96 }}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-pressed={sidebarCollapsed}
          >
            <PanelLeft className="size-4" aria-hidden />
          </motion.button>

          {/* 2 & 3. Page title + breadcrumb */}
          <div className="flex min-w-[8rem] flex-1 flex-col gap-0.5 sm:min-w-[12rem]">
            <h1 className="truncate text-sm font-semibold tracking-tight text-[var(--nestora-forest)] sm:text-base">
              {title}
            </h1>
            <nav aria-label="Breadcrumb" className="flex min-w-0 flex-wrap items-center gap-1 text-[11px] text-muted-foreground">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <span key={crumb.href} className="inline-flex min-w-0 items-center gap-1">
                    {index > 0 ? <ChevronRight className="size-3 shrink-0 opacity-50" aria-hidden /> : null}
                    {isLast ? (
                      <span className="truncate font-medium text-foreground" aria-current="page">
                        {crumb.label}
                      </span>
                    ) : (
                      <Link href={crumb.href} className={cn('truncate hover:text-foreground', focusRing)}>
                        {crumb.label}
                      </Link>
                    )}
                  </span>
                );
              })}
            </nav>
          </div>

          {/* 4. Global search */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className={cn(
              'hidden h-9 min-w-0 flex-1 items-center gap-2 rounded-full border border-[var(--nestora-sage-muted)] bg-card px-3 text-left text-caption text-muted-foreground sm:flex sm:max-w-xs lg:max-w-sm',
              'hover:border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))]',
              focusRing,
            )}
          >
            <Search className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">Search students, staff, rooms…</span>
            <kbd className="ml-auto hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground lg:inline">
              ⌘K
            </kbd>
          </button>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className={cn(
              'inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-[var(--nestora-sage-muted)] bg-card text-[var(--nestora-forest)] sm:hidden',
              focusRing,
            )}
            aria-label="Open search"
          >
            <Search className="size-4" aria-hidden />
          </button>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            <AdminNotificationsPanel />

            {/* 6. Theme toggle */}
            <AdminThemeToggle />

            <AdminProfileMenu />
          </div>
        </div>
      </header>

      <CommandDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        title="Global search"
        description="Search students, staff, rooms, and admin modules."
      >
        <CommandInput placeholder="Search students, staff, rooms, audit…" />
        <CommandList>
          <CommandEmpty>No results. Try audit logs or dashboard modules.</CommandEmpty>
          <CommandGroup heading="Quick navigation">
            {globalSearchItems.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.href}
                  onSelect={() => {
                    setSearchOpen(false);
                    router.push(item.href);
                  }}
                >
                  <Icon className="size-4 opacity-70" />
                  <span>{item.label}</span>
                  <span className="ml-2 text-muted-foreground">{item.hint}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Tip">
            <CommandItem disabled>Full-text search connects when directory APIs are enabled.</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
