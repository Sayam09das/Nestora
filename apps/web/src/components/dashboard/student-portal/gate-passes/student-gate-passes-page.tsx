'use client';

import { motion } from 'framer-motion';
import { DoorOpen, Loader2, QrCode, RefreshCw } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useStudentGatePassesDesk } from '@/hooks/use-student-gate-passes-desk';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function StudentGatePassesPage() {
  const { desk, loading, error, isRefreshing, refresh } = useStudentGatePassesDesk();

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <motion.div className="flex items-center gap-2">
            <QrCode className="size-5 text-[var(--nestora-sage)]" aria-hidden />
            <h1 className="text-2xl font-bold tracking-tight text-[var(--nestora-forest)]">Gate passes</h1>
          </motion.div>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Digital passes from approved leave or outings. Overdue returns are flagged here and on your home desk. Syncs every 20 seconds.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => refresh()} disabled={loading}>
              {loading || isRefreshing ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
              Refresh
            </Button>
            <Link href="/student/leave" className={cn('text-sm font-semibold text-[var(--nestora-sage)] hover:underline', focusRing)}>
              Apply for leave
            </Link>
          </div>
        </div>
      </header>

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
          {error}
        </div>
      ) : null}

      {loading && !desk ? (
        <Skeleton className="h-32 rounded-2xl" />
      ) : null}

      {desk ? (
        <>
          {desk.summary.overdue > 0 ? (
            <div className="rounded-xl border border-[color-mix(in_oklch,#c2410c_40%,var(--border))] bg-[color-mix(in_oklch,#c2410c_8%,var(--card))] px-4 py-3 text-sm text-[#9a3412]">
              {desk.summary.overdue} pass{desk.summary.overdue === 1 ? '' : 'es'} overdue — return to the hostel and check in at the gate.
            </div>
          ) : null}

          <section className="grid gap-3 sm:grid-cols-4">
            {(
              [
                ['Active', desk.summary.active],
                ['Overdue', desk.summary.overdue],
                ['Used', desk.summary.used],
                ['Expired', desk.summary.expired],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="rounded-xl border border-border bg-card px-4 py-3">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--nestora-forest)]">{value}</p>
              </div>
            ))}
          </section>

          {desk.passes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center">
              <DoorOpen className="mx-auto size-8 text-muted-foreground" aria-hidden />
              <p className="mt-3 text-sm text-muted-foreground">
                No gate passes yet. They appear here after your warden approves a leave request.
              </p>
              <Link
                href="/student/leave"
                className={cn('mt-4 inline-block text-sm font-semibold text-[var(--nestora-forest)] hover:underline', focusRing)}
              >
                Go to leave requests
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {desk.passes.map((pass) => (
                <li
                  key={pass.id}
                  className={cn(
                    'rounded-xl border bg-card p-4',
                    pass.status === 'active' && 'border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))]',
                    pass.status === 'overdue' &&
                      'border-[color-mix(in_oklch,#c2410c_45%,var(--border))] bg-[color-mix(in_oklch,#c2410c_6%,var(--card))]',
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-lg font-bold tracking-wider text-[var(--nestora-forest)]">{pass.passToken}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {pass.leaveType ?? 'Leave'} · {pass.dateRange}
                        {pass.destination ? ` · ${pass.destination}` : ''}
                      </p>
                    </div>
                    <Badge
                      variant={pass.status === 'active' || pass.status === 'overdue' ? 'default' : 'outline'}
                      className={
                        pass.status === 'overdue'
                          ? 'bg-[#c2410c]'
                          : pass.status === 'active'
                            ? 'bg-[var(--nestora-forest)]'
                            : undefined
                      }
                    >
                      {pass.statusLabel}
                    </Badge>
                  </div>
                  <p className="mt-3 text-[11px] text-muted-foreground">
                    Valid {formatWhen(pass.validFrom)} — {formatWhen(pass.validUntil)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : null}
    </div>
  );
}