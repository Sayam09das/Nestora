'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { BookOpen, LifeBuoy, Phone } from 'lucide-react';
import Link from 'next/link';

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
          <DropdownMenuItem className="rounded-lg" render={<Link href="/student/emergency" />}>
            <Phone className="size-4 text-[var(--nestora-gold)]" />
            Emergency contacts
          </DropdownMenuItem>
          <DropdownMenuItem className="rounded-lg" render={<Link href="/student/rules" />}>
            <BookOpen className="size-4 text-[var(--nestora-sage)]" />
            Hostel rules
          </DropdownMenuItem>
          <DropdownMenuItem className="rounded-lg" render={<Link href="/student/help" />}>
            <LifeBuoy className="size-4 text-[var(--nestora-forest)]" />
            Help &amp; support
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
