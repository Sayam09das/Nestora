'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { BookOpen, LifeBuoy, Phone } from 'lucide-react';
import { toast } from 'sonner';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

export function StudentTopbarHelpMenu() {
  const reduceMotion = useReducedMotion();

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
          <DropdownMenuLabel className="text-xs text-muted-foreground">Hostel support</DropdownMenuLabel>
          <DropdownMenuItem
            className="rounded-lg"
            onClick={() => toast.message('Duty warden', { description: 'Block B warden line (sample).' })}
          >
            <Phone className="size-4 text-[var(--nestora-gold)]" />
            Call duty warden
          </DropdownMenuItem>
          <DropdownMenuItem
            className="rounded-lg"
            onClick={() => toast.message('Student handbook', { description: 'Rules, curfew, and visitor policy (sample).' })}
          >
            <BookOpen className="size-4 text-[var(--nestora-sage)]" />
            Hostel handbook
          </DropdownMenuItem>
          <DropdownMenuItem
            className="rounded-lg"
            onClick={() => toast.message('Report an issue', { description: 'Use Complaints for maintenance requests.' })}
          >
            <LifeBuoy className="size-4 text-[var(--nestora-forest)]" />
            Get help
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
