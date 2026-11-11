'use client';

import { ChevronRight, Moon, PanelLeft, Sun } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

import { getStaffRouteMeta } from '@/components/dashboard/staff-portal/staff-route-meta';
import { useStaffShell } from '@/components/dashboard/staff-portal/staff-shell-provider';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <span className="size-9" aria-hidden />;
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

export function StaffDashboardTopbar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, toggleMobileNav } = useStaffShell();
  const { title, breadcrumbs } = getStaffRouteMeta(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-[color-mix(in_oklch,var(--card)_92%,white)]/95 backdrop-blur-sm">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          className={cn(
            'inline-flex size-9 items-center justify-center rounded-lg border border-border bg-card text-[var(--nestora-forest)] md:hidden',
            focusRing,
          )}
          onClick={toggleMobileNav}
          aria-label="Open navigation"
        >
          <PanelLeft className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          className={cn(
            'hidden size-9 items-center justify-center rounded-lg border border-border bg-card text-[var(--nestora-forest)] md:inline-flex',
            focusRing,
          )}
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <PanelLeft className="size-4" aria-hidden />
        </button>

        <nav className="min-w-0 flex-1" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1 text-sm">
            {breadcrumbs.map((crumb, i) => {
              const last = i === breadcrumbs.length - 1;
              return (
                <li key={crumb.href} className="flex min-w-0 items-center gap-1">
                  {i > 0 ? <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden /> : null}
                  {last ? (
                    <span className="truncate font-semibold text-[var(--nestora-forest)]">{title}</span>
                  ) : (
                    <Link href={crumb.href} className="truncate text-muted-foreground hover:text-foreground">
                      {crumb.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <ThemeToggle />
      </div>
    </header>
  );
}
