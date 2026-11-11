'use client';

import { BedDouble, Building2 } from 'lucide-react';

import { useStudentShell } from '@/components/dashboard/student-portal/student-shell-provider';
import { cn } from '@/lib/utils';

type Props = { compact?: boolean; iconOnly?: boolean; className?: string };

export function StudentTopbarResidence({ compact, iconOnly, className }: Props) {
  const { hostelName, roomLabel } = useStudentShell();

  if (iconOnly) {
    return (
      <span
        className={cn(
          'inline-flex size-9 items-center justify-center rounded-full border border-[var(--nestora-sage-muted)] bg-card text-[var(--nestora-forest)]',
          className,
        )}
        title={`${hostelName} · ${roomLabel}`}
        aria-label={`Residence: ${hostelName}, ${roomLabel}`}
      >
        <BedDouble className="size-4" aria-hidden />
      </span>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex max-w-[15rem] flex-col justify-center rounded-2xl border border-[var(--nestora-sage-muted)] bg-card px-2.5',
        compact ? 'h-9 py-0.5' : 'h-auto min-h-9 py-1.5',
        className,
      )}
      title={`${hostelName} · ${roomLabel}`}
    >
      <span className="flex items-center gap-1.5 text-[11px] font-semibold leading-tight text-[var(--nestora-forest)]">
        <Building2 className="size-3 shrink-0 text-[var(--nestora-sage)]" aria-hidden />
        <span className="truncate">{hostelName}</span>
      </span>
      <span className="mt-0.5 flex items-center gap-1.5 truncate pl-[1.125rem] text-[10px] font-medium text-muted-foreground">
        <BedDouble className="size-3 shrink-0 opacity-70" aria-hidden />
        {roomLabel}
        <span className="rounded-full bg-[color-mix(in_oklch,var(--nestora-sage)_12%,var(--muted))] px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-[var(--nestora-forest)]">
          Resident
        </span>
      </span>
    </div>
  );
}
