'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Building2, Download, UserCheck, Users } from 'lucide-react';
import { useRef } from 'react';

import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  hostelName: string;
  totalResidents: number;
  pendingVerification: number;
};

export function WardenStudentsHeader({ hostelName, totalResidents, pendingVerification }: Props) {
  const reduceMotion = useReducedMotion();
  const headerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reduceMotion || !headerRef.current) return;
      gsap.from(headerRef.current.querySelectorAll('[data-warden-students-hero]'), {
        opacity: 0,
        y: 14,
        duration: 0.42,
        stagger: 0.08,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: headerRef, dependencies: [reduceMotion] },
  );

  return (
    <header
      ref={headerRef}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))]',
        'bg-[linear-gradient(135deg,color-mix(in_oklch,var(--nestora-cream)_50%,var(--card))_0%,var(--card)_60%)] shadow-sm',
      )}
    >
      <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-end sm:justify-between">
        <div data-warden-students-hero className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--nestora-sage)]">Student Management</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--nestora-forest)]">
            Residents &amp; verifications
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            View students assigned to your hostel, room allocations, and second-tier admission checks (FR-012).
          </p>
          <motion.div
            className="mt-3 flex flex-wrap items-center gap-2"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.08, duration: 0.35, ease: motionEase }}
          >
            <Badge
              variant="outline"
              className="gap-1.5 border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] bg-card font-semibold text-[var(--nestora-forest)]"
            >
              <Building2 className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
              {hostelName}
            </Badge>
            <span className="text-xs text-muted-foreground">Hostel-scoped · no cross-hostel access</span>
          </motion.div>
        </div>

        <motion.div
          data-warden-students-hero
          className="flex flex-wrap gap-2"
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.35, ease: motionEase }}
        >
          <div className="flex items-center gap-3 rounded-xl border border-border/80 bg-card/90 px-3 py-2 shadow-sm">
            <Users className="size-4 text-[var(--nestora-forest)]" aria-hidden />
            <div>
              <p className="text-lg font-semibold tabular-nums leading-none">{totalResidents}</p>
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Residents</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-[color-mix(in_oklch,var(--nestora-gold)_30%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_8%,var(--card))] px-3 py-2 shadow-sm">
            <UserCheck className="size-4 text-[var(--nestora-gold)]" aria-hidden />
            <div>
              <p className="text-lg font-semibold tabular-nums leading-none">{pendingVerification}</p>
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Tier-2 queue</p>
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" className={cn('rounded-xl', focusRing)} disabled title="Export coming soon">
            <Download className="size-4" aria-hidden />
            Export roster
          </Button>
        </motion.div>
      </div>
    </header>
  );
}
