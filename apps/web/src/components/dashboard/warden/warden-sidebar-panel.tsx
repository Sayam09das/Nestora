'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { wardenNavLinks } from '@/components/dashboard/warden/warden-nav-items';
import { NESTORA_BRAND_NAME } from '@/components/marketing/navbar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/35';

type Props = { collapsed: boolean; onNavigate?: () => void; className?: string };

export function WardenSidebarPanel({ collapsed, onNavigate, className }: Props) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        'relative z-10 flex h-full min-h-0 flex-col overflow-hidden py-4',
        collapsed ? 'items-center px-2' : 'px-3',
        className,
      )}
    >
      <Link
        href="/warden"
        data-warden-side-item
        onClick={onNavigate}
        className={cn(
          'group flex shrink-0 rounded-xl p-2 transition-colors hover:bg-white/[0.06]',
          collapsed ? 'justify-center' : 'items-center gap-3',
          focusRing,
        )}
        title={collapsed ? 'Warden desk' : undefined}
      >
        <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/15 bg-white/10 shadow-sm">
          <Image src="/images/nestora-mark.svg" alt="" width={36} height={36} className="size-7 object-contain" unoptimized />
        </span>
        {!collapsed ? (
          <span className="min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">{NESTORA_BRAND_NAME}</span>
            <span className="block text-sm font-semibold tracking-tight text-white">Warden desk</span>
          </span>
        ) : null}
      </Link>

      <ScrollArea className="mt-3 h-full min-h-0 flex-1 pr-1">
        <ul className="space-y-1">
          {wardenNavLinks.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== '/warden' && pathname.startsWith(item.href));
            return (
              <li key={item.href} data-warden-side-item>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-colors',
                    active ? 'bg-white/12 font-semibold text-white' : 'text-white/75 hover:bg-white/[0.06] hover:text-white',
                    collapsed && 'justify-center px-2',
                    focusRing,
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="size-4 shrink-0" aria-hidden />
                  {!collapsed ? <span className="truncate">{item.label}</span> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </ScrollArea>
    </div>
  );
}
