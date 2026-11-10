'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Building2, Check, ChevronDown } from 'lucide-react';

import { useWardenShell } from '@/components/dashboard/warden/warden-shell-provider';
import { WARDEN_ASSIGNED_HOSTELS } from '@/components/dashboard/warden/warden-topbar-data';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = { className?: string; compact?: boolean; iconOnly?: boolean };

export function WardenTopbarHostelSelector({ className, compact, iconOnly }: Props) {
  const reduceMotion = useReducedMotion();
  const { selectedHostelId, setSelectedHostelId } = useWardenShell();
  const active = WARDEN_ASSIGNED_HOSTELS.find((h) => h.id === selectedHostelId) ?? WARDEN_ASSIGNED_HOSTELS[0]!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'inline-flex h-9 max-w-[11.5rem] items-center gap-1.5 rounded-full border border-[var(--nestora-sage-muted)] bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--card))] px-2.5 text-left',
          'transition-[border-color,box-shadow] hover:border-[color-mix(in_oklch,var(--nestora-sage)_32%,var(--border))] hover:shadow-sm',
          iconOnly && 'size-9 max-w-9 justify-center px-0',
          focusRing,
          className,
        )}
        aria-label={`Assigned hostel: ${active.label}`}
      >
        <span
          className={cn(
            'flex size-6 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--muted))] text-[var(--nestora-forest)]',
            iconOnly && 'size-7',
          )}
        >
          <Building2 className="size-3.5" aria-hidden />
        </span>
        {!iconOnly ? (
          <>
            <span className="min-w-0 flex-1 truncate text-caption font-semibold text-foreground">
              {compact ? active.shortLabel : active.label}
            </span>
            <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          </>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 rounded-xl">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">Switch assigned hostel</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {WARDEN_ASSIGNED_HOSTELS.map((hostel) => {
            const selected = hostel.id === selectedHostelId;
            return (
              <DropdownMenuItem key={hostel.id} className="rounded-lg" onClick={() => setSelectedHostelId(hostel.id)}>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-center gap-2 font-medium">
                    {hostel.label}
                    {selected ? (
                      <motion.span initial={reduceMotion ? false : { scale: 0 }} animate={{ scale: 1 }}>
                        <Check className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
                      </motion.span>
                    ) : null}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {hostel.rooms} rooms · {hostel.occupancy} occupied
                  </span>
                </span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
