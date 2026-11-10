'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { GitCompare } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

import {
  FR_HINTS,
  categorizeAction,
  formatAuditWhen,
  formatState,
  severityFor,
} from '@/components/dashboard/audit-logs/admin-audit-logs-data';
import type { AuditLogRow } from '@/lib/api/audit';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = { log: AuditLogRow | null };

export function AdminAuditLogsInspectPanel({ log }: Props) {
  const reduceMotion = useReducedMotion();
  const diffRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reduceMotion || !diffRef.current || !log) return;
      gsap.from(diffRef.current.querySelectorAll('pre'), {
        opacity: 0,
        y: 8,
        stagger: 0.08,
        duration: 0.35,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: diffRef, dependencies: [log?.id, reduceMotion], revertOnUpdate: true },
  );

  if (!log) {
    return (
      <section className="rounded-2xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
        Select an entry to preview state transition.
      </section>
    );
  }

  const fr = FR_HINTS[log.actionName];

  return (
    <motion.section data-aud-reveal layout className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-4 sm:px-5">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--nestora-sage)]">
            <GitCompare className="size-3.5" aria-hidden />
            State diff
          </p>
          <h2 className="mt-1 font-mono text-sm font-semibold text-[var(--nestora-forest)]">{log.actionName}</h2>
          <p className="text-xs text-muted-foreground">
            {categorizeAction(log.actionName)} · {severityFor(log.actionName)}
            {fr ? ` · ${fr}` : ''} · {formatAuditWhen(log.timestamp)}
          </p>
        </div>
        <Button nativeButton={false} size="sm" className={cn('rounded-xl', focusRing)} render={<Link href={`/admin/audit-logs/${log.id}`} />}>
          Full inspect
        </Button>
      </header>
      <div ref={diffRef} className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase text-muted-foreground">Previous</p>
          <pre className="max-h-48 overflow-auto rounded-xl border bg-muted/40 p-3 font-mono text-[11px] leading-relaxed">{formatState(log.previousState)}</pre>
        </div>
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase text-muted-foreground">New</p>
          <pre className="max-h-48 overflow-auto rounded-xl border bg-[color-mix(in_oklch,var(--nestora-cream)_15%,var(--card))] p-3 font-mono text-[11px] leading-relaxed">{formatState(log.newState)}</pre>
        </div>
      </div>
    </motion.section>
  );
}
