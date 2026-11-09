'use client';

import Image from 'next/image';
import Link from 'next/link';

import { adminNavGroups } from '@/components/dashboard/admin-nav-items';
import { AdminSidebarAccount } from '@/components/dashboard/admin-sidebar-account';
import { AdminSidebarNav } from '@/components/dashboard/admin-sidebar-nav';
import { NESTORA_BRAND_NAME } from '@/components/marketing/navbar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/35';

type AdminSidebarPanelProps = {
  collapsed: boolean;
  onNavigate?: () => void;
  className?: string;
};

export function AdminSidebarPanel({ collapsed, onNavigate, className }: AdminSidebarPanelProps) {
  return (
    <div
      className={cn(
        'relative z-10 flex h-full min-h-0 flex-col overflow-hidden py-4',
        collapsed ? 'items-center px-2' : 'px-3',
        className,
      )}
    >
      <Link
        href="/admin"
        data-admin-side-item
        onClick={onNavigate}
        className={cn(
          'group flex shrink-0 rounded-xl p-2 transition-colors hover:bg-white/[0.06]',
          collapsed ? 'justify-center' : 'items-center gap-3',
          focusRing,
        )}
        title={collapsed ? `${NESTORA_BRAND_NAME} command` : undefined}
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
        {!collapsed ? (
          <span className="min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
              {NESTORA_BRAND_NAME}
            </span>
            <span className="block text-sm font-semibold tracking-tight text-white">Command</span>
          </span>
        ) : null}
      </Link>

      <div className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden">
        <ScrollArea className="h-full min-h-0 flex-1 pr-1">
          <AdminSidebarNav groups={adminNavGroups} collapsed={collapsed} onNavigate={onNavigate} />
        </ScrollArea>
      </div>

      <div data-admin-side-item className="shrink-0">
        <AdminSidebarAccount />
      </div>
    </div>
  );
}
