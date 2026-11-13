'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { BarChart3, ClipboardList, LifeBuoy, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

export function WardenTopbarHelpMenu() {
  const reduceMotion = useReducedMotion();
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'inline-flex size-9 items-center justify-center rounded-full border border-[var(--nestora-sage-muted)] bg-card text-[var(--nestora-forest)]',
          'transition-colors hover:bg-muted/80',
          focusRing,
        )}
        aria-label="Help and support"
      >
        <motion.span whileTap={reduceMotion ? undefined : { scale: 0.94 }}>
          <LifeBuoy className="size-4" aria-hidden />
        </motion.span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">Warden desks</DropdownMenuLabel>
          <DropdownMenuItem
            className="rounded-lg"
            onClick={() => router.push('/warden/register')}
          >
            <ClipboardList className="size-4 text-[var(--nestora-sage)]" />
            Daily register log
          </DropdownMenuItem>
          <DropdownMenuItem
            className="rounded-lg"
            onClick={() => router.push('/warden/reports')}
          >
            <BarChart3 className="size-4 text-[var(--nestora-gold)]" />
            Reports &amp; analytics
          </DropdownMenuItem>
          <DropdownMenuItem
            className="rounded-lg"
            onClick={() => router.push('/warden/profile')}
          >
            <UserRound className="size-4 text-[var(--nestora-forest)]" />
            Profile &amp; emergency contact
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="rounded-lg" onClick={() => router.push('/warden/incidents')}>
          <LifeBuoy className="size-4 text-destructive" />
          Report / view incidents
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
