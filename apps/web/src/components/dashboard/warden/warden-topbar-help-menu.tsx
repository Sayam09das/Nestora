'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { BookOpen, Headphones, LifeBuoy, Phone } from 'lucide-react';
import { toast } from 'sonner';

import {
  DropdownMenu,
  DropdownMenuContent,
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
        <DropdownMenuLabel className="text-xs text-muted-foreground">Warden assistance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="rounded-lg"
          onClick={() => toast.message('Duty officer', { description: '+91 98765 43210 · escalation line (sample).' })}
        >
          <Phone className="size-4 text-[var(--nestora-gold)]" />
          Call duty officer
        </DropdownMenuItem>
        <DropdownMenuItem
          className="rounded-lg"
          onClick={() => toast.message('Admin support', { description: 'Connects to university admin desk (sample).' })}
        >
          <Headphones className="size-4 text-[var(--nestora-sage)]" />
          Live support chat
        </DropdownMenuItem>
        <DropdownMenuItem
          className="rounded-lg"
          onClick={() => toast.message('Handbook', { description: 'Warden SOP library (sample).' })}
        >
          <BookOpen className="size-4 text-[var(--nestora-forest)]" />
          Warden handbook
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
