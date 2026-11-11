'use client';

import { Building2 } from 'lucide-react';

import { useStaffShell } from '@/components/dashboard/staff-portal/staff-shell-provider';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = { compact?: boolean; iconOnly?: boolean; className?: string };

export function StaffTopbarWorkplace({ compact, iconOnly, className }: Props) {
  const { workplaceName } = useStaffShell();

  if (iconOnly) {
    return (
      <span
        className={cn(
          'inline-flex size-9 items-center justify-center rounded-full border border-[var(--nestora-sage-muted)] bg-card text-[var(--nestora-forest)]',
          className,
        )}
        title={workplaceName}
        aria-label={`Assigned workplace: ${workplaceName}`}
      >
        <Building2 className="size-4" aria-hidden />
      </span>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex max-w-[11rem] items-center gap-2 rounded-full border border-[var(--nestora-sage-muted)] bg-card px-2.5',
        compact ? 'h-9' : 'h-10 py-1',
        className,
      )}
      title={workplaceName}
    >
      <span
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--muted))] text-[var(--nestora-forest)]',
          focusRing,
        )}
        aria-hidden
      >
        <Building2 className="size-3.5" />
      </span>
      <span className="min-w-0 truncate text-caption font-semibold text-foreground">{workplaceName}</span>
    </div>
  );
}
