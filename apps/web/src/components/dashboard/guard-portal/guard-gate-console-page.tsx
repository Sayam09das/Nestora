'use client';

import { motion } from 'framer-motion';
import { ArrowDownLeft, ArrowUpRight, Loader2, RefreshCw, ScanLine, Shield } from 'lucide-react';
import { useCallback, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useGuardGateConsole } from '@/hooks/use-guard-gate-console';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

const phaseLabel: Record<string, string> = {
  ready_exit: 'Ready to exit',
  out: 'Currently out',
  returned: 'Returned',
  closed: 'Closed',
};

export function GuardGateConsolePage() {
  const {
    desk,
    lookup,
    loading,
    actionLoading,
    error,
    isRefreshing,
    refresh,
    runLookup,
    runExit,
    runReturn,
    clearLookup,
  } = useGuardGateConsole();
  const [token, setToken] = useState('');

  const onLookup = useCallback(async () => {
    const trimmed = token.trim();
    if (!trimmed) return;
    await runLookup(trimmed);
  }, [token, runLookup]);

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <motion.div className="flex items-center gap-2">
            <Shield className="size-5 text-[var(--nestora-sage)]" aria-hidden />
            <h1 className="text-2xl font-bold tracking-tight text-[var(--nestora-forest)]">Gate console</h1>
          </motion.div>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Scan or type a student gate pass token to record exit and return. Scoped to your assigned hostel(s).
          </p>
          {desk?.hostelNames.length ? (
            <p className="mt-2 text-xs text-muted-foreground">Assignment: {desk.hostelNames.join(' · ')}</p>
          ) : null}
        </div>
        <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => refresh()} disabled={loading}>
          {loading || isRefreshing ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
          Refresh
        </Button>
      </header>

      {desk?.unassigned ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100" role="status">
          No hostel assigned to your guard account. Ask the warden to add a hostel assignment before scanning passes.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
          {error}
        </div>
      ) : null}

      {loading && !desk ? <Skeleton className="h-24 rounded-2xl" /> : null}

      {desk && !desk.unassigned ? (
        <section className="grid gap-3 sm:grid-cols-3">
          {(
            [
              ['Out now', desk.summary.currentlyOut],
              ['Exits today', desk.summary.exitsToday],
              ['Returns today', desk.summary.returnsToday],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="rounded-xl border border-border bg-card px-4 py-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--nestora-forest)]">{value}</p>
            </div>
          ))}
        </section>
      ) : null}

      <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <label htmlFor="gate-token" className="text-sm font-semibold text-[var(--nestora-forest)]">
          Pass token
        </label>
        <motion.div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <ScanLine className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              id="gate-token"
              value={token}
              onChange={(e) => setToken(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void onLookup();
              }}
              placeholder="GP-…"
              className={cn('pl-9 font-mono uppercase tracking-wider', focusRing)}
              autoComplete="off"
              disabled={desk?.unassigned}
            />
          </div>
          <Button type="button" onClick={() => void onLookup()} disabled={actionLoading || !token.trim() || desk?.unassigned}>
            {actionLoading ? <Loader2 className="size-4 animate-spin" /> : 'Look up'}
          </Button>
        </motion.div>
      </section>

      {lookup ? (
        <section className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_30%,var(--border))] bg-card p-4 sm:p-6">
          <motion.div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-xl font-bold tracking-widest text-[var(--nestora-forest)]">{lookup.passToken}</p>
              <p className="mt-1 text-lg font-semibold">{lookup.studentName}</p>
              <p className="text-sm text-muted-foreground">
                {lookup.registrationNumber} · {lookup.hostelName} · {lookup.roomBed}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {lookup.leaveType} → {lookup.destination}
              </p>
            </div>
            <h2 className="sr-only">Pass scan outcome</h2>
            <motion.div className="flex flex-wrap gap-2">
              <Badge variant="outline">{phaseLabel[lookup.movementPhase] ?? lookup.movementPhase}</Badge>
              {lookup.isLateReturnRisk ? (
                <Badge className="bg-amber-500 text-[var(--nestora-forest)]">Late return risk</Badge>
              ) : null}
            </motion.div>
          </motion.div>

          <p className="mt-3 text-xs text-muted-foreground">
            Valid {formatWhen(lookup.validFrom)} — {formatWhen(lookup.validUntil)}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {lookup.canRecordExit ? (
              <Button
                type="button"
                className="gap-1.5"
                disabled={actionLoading}
                onClick={() => void runExit(lookup.passId)}
              >
                <ArrowUpRight className="size-4" aria-hidden />
                Record exit
              </Button>
            ) : null}
            {lookup.canRecordReturn ? (
              <Button
                type="button"
                variant="secondary"
                className="gap-1.5"
                disabled={actionLoading}
                onClick={() => void runReturn(lookup.passId)}
              >
                <ArrowDownLeft className="size-4" aria-hidden />
                Record return
              </Button>
            ) : null}
            <Button type="button" variant="ghost" size="sm" onClick={clearLookup}>
              Clear
            </Button>
          </div>
        </section>
      ) : null}

      {desk && desk.recentMovements.length > 0 ? (
        <section>
          <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">Recent gate activity</h2>
          <ul className="mt-3 divide-y rounded-xl border border-border bg-card">
            {desk.recentMovements.slice(0, 8).map((row) => (
              <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium">{row.studentName}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.passToken} · {row.roomBed}
                  </p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <Badge variant={row.status === 'out' ? 'default' : 'outline'} className="mb-1">
                    {row.status === 'out' ? 'Out' : row.isLateReturn ? 'Late return' : 'Returned'}
                  </Badge>
                  {row.actualDeparture ? <p>Out {formatWhen(row.actualDeparture)}</p> : null}
                  {row.actualReturn ? <p>In {formatWhen(row.actualReturn)}</p> : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}