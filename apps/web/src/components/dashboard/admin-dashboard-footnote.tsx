'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Keyboard, Settings, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

export function AdminDashboardFootnote() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.aside
      className={cn(
        'rounded-2xl border border-dashed border-[color-mix(in_oklch,var(--nestora-sage)_30%,var(--border))]',
        'bg-[color-mix(in_oklch,var(--nestora-cream)_30%,var(--muted))] px-4 py-4 sm:px-5',
      )}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      role="note"
      aria-label="Dashboard notes and shortcuts"
    >
      <p className="text-center text-xs text-muted-foreground">
        Metrics refresh about every minute from the Nestora API. Fees and notices fill in as MS-4 and MOD-17 ship.
      </p>
      <ul className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-semibold text-[var(--nestora-forest)]">
        <li>
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <Keyboard className="size-3.5" aria-hidden />
            Press{' '}
            <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd> to search
          </span>
        </li>
        <li>
          <Link href="/admin/settings" className={cn('inline-flex items-center gap-1 hover:underline', focusRing)}>
            <Settings className="size-3.5" aria-hidden />
            Settings
          </Link>
        </li>
        <li>
          <Link href="/admin/roles" className={cn('inline-flex items-center gap-1 hover:underline', focusRing)}>
            <ShieldCheck className="size-3.5" aria-hidden />
            Roles &amp; access
          </Link>
        </li>
      </ul>
    </motion.aside>
  );
}
