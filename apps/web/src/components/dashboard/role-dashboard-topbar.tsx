'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

import { AdminProfileMenu } from '@/components/dashboard/admin-profile-menu';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
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

type RoleDashboardTopbarProps = {
  title: string;
  subtitle?: string;
};

export function RoleDashboardTopbar({ title, subtitle }: RoleDashboardTopbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-[color-mix(in_oklch,var(--card)_92%,white)]/95 backdrop-blur-sm">
      <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--nestora-forest)]">{title}</p>
          {subtitle ? <p className="truncate text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <AdminProfileMenu />
        </div>
      </div>
    </header>
  );
}
