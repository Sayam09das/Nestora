'use client';

import { ClipboardCheck, DoorOpen, UserPlus } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

const links = [
  { href: '/warden/attendance', label: 'Attendance roster', icon: ClipboardCheck, hint: 'MOD-09' },
  { href: '/warden/leave', label: 'Leave & outings', icon: DoorOpen, hint: 'MOD-08' },
] as const;

type Props = {
  onOpenVerification?: () => void;
};

export function WardenStudentsQuickLinks({ onOpenVerification }: Props) {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-[color-mix(in_oklch,var(--nestora-sage)_30%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-cream)_25%,var(--muted))] px-4 py-3">
      <p className="text-xs text-muted-foreground">Related desk actions for this hostel</p>
      <div className="flex flex-wrap gap-2">
        {onOpenVerification ? (
          <button
            type="button"
            onClick={onOpenVerification}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-xl border border-[var(--nestora-gold)] bg-[color-mix(in_oklch,var(--nestora-gold)_10%,var(--card))] px-3 py-1.5 text-xs font-semibold text-[var(--nestora-forest)] hover:bg-muted/50',
              focusRing,
            )}
          >
            <UserPlus className="size-3.5 text-[var(--nestora-gold)]" aria-hidden />
            Verification queue
            <span className="text-[10px] font-medium text-muted-foreground">FR-012</span>
          </button>
        ) : null}
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-xl border border-[var(--nestora-sage-muted)] bg-card px-3 py-1.5 text-xs font-semibold text-[var(--nestora-forest)] hover:bg-muted/50',
                focusRing,
              )}
            >
              <Icon className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
              {item.label}
              <span className="text-[10px] font-medium text-muted-foreground">{item.hint}</span>
            </Link>
          );
        })}
      </div>
    </footer>
  );
}
