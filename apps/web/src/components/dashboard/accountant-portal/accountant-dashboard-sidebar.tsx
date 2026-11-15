'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { accountantNavLinks } from '@/components/dashboard/accountant-portal/accountant-nav-items';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

export function AccountantDashboardSidebar() {
  const pathname = usePathname() ?? '/accountant';

  return (
    <nav
      aria-label="Accountant portal"
      className="hidden w-52 shrink-0 border-r border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card/50 px-3 py-5 md:block"
    >
      <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Finance desk</p>
      <ul className="mt-3 space-y-0.5">
        {accountantNavLinks.map((item) => {
          const active = item.isActive(pathname);
          const Icon = item.icon;
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-[color-mix(in_oklch,var(--nestora-forest)_12%,transparent)] text-[var(--nestora-forest)]'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                  focusRing,
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}