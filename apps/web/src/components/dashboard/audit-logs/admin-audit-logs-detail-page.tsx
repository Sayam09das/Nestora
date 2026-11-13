'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Fingerprint } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

import {
  FR_HINTS,
  categorizeAction,
  formatAuditWhen,
  formatState,
  severityFor,
} from '@/components/dashboard/audit-logs/admin-audit-logs-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { type AuditLogRow } from '@/lib/api/audit';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = { log: AuditLogRow };

export function AdminAuditLogsDetailPage({ log }: Props) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-aud-detail]'), {
        opacity: 0,
        y: 10,
        stagger: 0.05,
        duration: 0.38,
        clearProps: 'opacity,transform',
      });
    },
    { scope: rootRef, dependencies: [reduceMotion, log.id] },
  );

  const fr = FR_HINTS[log.actionName];

  return (
    <div ref={rootRef} className="space-y-6 pb-8">
      <div data-aud-detail className="flex flex-wrap items-center gap-3">
        <Button nativeButton={false} variant="outline" size="sm" className="rounded-xl" render={<Link href="/admin/audit-logs" className={focusRing} />}>
          <ArrowLeft className="size-4" aria-hidden />
          Activity logs
        </Button>
        <p className="font-mono text-xs text-muted-foreground">{log.id}</p>
      </div>

      <header data-aud-detail className="rounded-2xl border bg-card p-6 shadow-sm">
        <motion.div layout className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-mono text-xl font-semibold text-[var(--nestora-forest)]">{log.actionName}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {log.entityType} · <span className="font-mono">{log.entityId}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {log.actorRole}
              {log.actorUserId ? <span className="font-mono"> · {log.actorUserId}</span> : null}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-full capitalize">
              {severityFor(log.actionName)}
            </Badge>
            <Badge variant="outline" className="rounded-full">
              {categorizeAction(log.actionName)}
            </Badge>
            {fr ? (
              <Badge variant="outline" className="rounded-full">
                {fr}
              </Badge>
            ) : null}
          </div>
        </motion.div>
        <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Fingerprint className="size-3.5" aria-hidden />
          <time dateTime={log.timestamp}>{formatAuditWhen(log.timestamp)}</time>
          {log.ipAddress ? <span className="font-mono">· {log.ipAddress}</span> : null}
        </p>
      </header>

      <motion.section data-aud-detail className="grid gap-4 lg:grid-cols-2" layout>
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">Previous state</h2>
          <pre className="mt-3 max-h-[28rem] overflow-auto rounded-xl border bg-muted/40 p-4 font-mono text-xs leading-relaxed">{formatState(log.previousState)}</pre>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">New state</h2>
          <pre className="mt-3 max-h-[28rem] overflow-auto rounded-xl border bg-[color-mix(in_oklch,var(--nestora-cream)_15%,var(--card))] p-4 font-mono text-xs leading-relaxed">{formatState(log.newState)}</pre>
        </div>
      </motion.section>

      <p data-aud-detail className="text-xs text-muted-foreground">
        Immutable record — corrections append a new entry; this row is never mutated (FR-140).
      </p>
    </div>
  );
}
