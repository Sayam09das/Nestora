'use client';

import { NestoraBrandImage } from '@/components/brand/nestora-brand-image';
import Link from 'next/link';

import { StudentSidebarAccount } from '@/components/dashboard/student-portal/student-sidebar-account';
import { StudentSidebarNav } from '@/components/dashboard/student-portal/student-sidebar-nav';
import { NESTORA_BRAND_NAME } from '@/components/marketing/navbar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/35';

type Props = { collapsed: boolean; onNavigate?: () => void; className?: string };

export function StudentSidebarPanel({ collapsed, onNavigate, className }: Props) {
  return (
    <div
      className={cn(
        'relative z-10 flex h-full min-h-0 flex-col overflow-hidden py-4',
        collapsed ? 'items-center px-2' : 'px-3',
        className,
      )}
    >
      <Link
        href="/student"
        data-student-side-item
        onClick={onNavigate}
        className={cn(
          'group flex shrink-0 rounded-xl p-2 transition-colors hover:bg-white/[0.06]',
          collapsed ? 'justify-center' : 'items-center gap-3',
          focusRing,
        )}
        title={collapsed ? 'Student Portal' : undefined}
      >
        <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/15 bg-black/40 shadow-sm">
          <NestoraBrandImage variant="mark" className="size-8" />
        </span>
        {!collapsed ? (
          <span className="min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">{NESTORA_BRAND_NAME}</span>
            <span className="block text-sm font-semibold tracking-tight text-white">Student Portal</span>
          </span>
        ) : null}
      </Link>

      <div className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden">
        <ScrollArea className="h-full min-h-0 flex-1 pr-1">
          <StudentSidebarNav collapsed={collapsed} onNavigate={onNavigate} />
        </ScrollArea>
      </div>

      <div data-student-side-item className="mt-3 shrink-0 px-1">
        <StudentSidebarAccount />
      </div>
    </div>
  );
}
