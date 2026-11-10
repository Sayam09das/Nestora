'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ClipboardPlus, MessageSquarePlus, Plus, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';

import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
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

const actions = [
  {
    id: 'visitor',
    label: 'Register visitor',
    hint: 'Gate desk · FR-052',
    href: '/warden/visitors',
    icon: UserPlus,
    accent: 'var(--nestora-sage)',
  },
  {
    id: 'issue',
    label: 'Report issue',
    hint: 'Log maintenance ticket',
    href: '/warden/complaints',
    icon: MessageSquarePlus,
    accent: '#d97706',
  },
  {
    id: 'attendance',
    label: 'Mark attendance',
    hint: 'Tonight’s roll call',
    href: '/warden/attendance',
    icon: ClipboardPlus,
    accent: 'var(--nestora-forest)',
  },
] as const;

export function WardenTopbarQuickActions() {
  const reduceMotion = useReducedMotion();
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useGSAP(
    () => {
      if (reduceMotion || !open || !menuRef.current) return;
      gsap.from(menuRef.current.querySelectorAll('[data-warden-quick]'), {
        opacity: 0,
        y: 8,
        stagger: 0.05,
        duration: 0.32,
        ease: 'back.out(1.2)',
        clearProps: 'opacity,transform',
      });
    },
    { scope: menuRef, dependencies: [open, reduceMotion] },
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        className={cn(
          'inline-flex size-9 items-center justify-center rounded-full border border-[color-mix(in_oklch,var(--nestora-forest)_25%,var(--border))]',
          'bg-[var(--nestora-forest)] text-white shadow-sm transition-[transform,box-shadow]',
          'hover:bg-[color-mix(in_oklch,var(--nestora-forest),white_8%)] hover:shadow-md',
          focusRing,
        )}
        aria-label="Quick actions"
      >
        <motion.span whileTap={reduceMotion ? undefined : { scale: 0.9, rotate: 90 }} transition={{ duration: 0.15 }}>
          <Plus className="size-4" aria-hidden strokeWidth={2.5} />
        </motion.span>
      </DropdownMenuTrigger>
      <DropdownMenuContent ref={menuRef} align="end" className="w-60 rounded-xl">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">Quick actions</DropdownMenuLabel>
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <DropdownMenuItem
                key={action.id}
                data-warden-quick
                className="rounded-lg py-2.5"
                render={<Link href={action.href} onClick={() => setOpen(false)} />}
              >
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-muted/40"
                  style={{ color: action.accent }}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{action.label}</span>
                  <span className="text-[10px] text-muted-foreground">{action.hint}</span>
                </span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
