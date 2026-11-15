'use client';

import { motion } from 'framer-motion';
import { Loader2, RefreshCw, ScrollText } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGuardGateConsole } from '@/hooks/use-guard-gate-console';

function formatWhen(iso: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function GuardMovementsPage() {
  const { desk, loading, isRefreshing, refresh } = useGuardGateConsole();

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ScrollText className="size-5 text-[var(--nestora-sage)]" aria-hidden />
            <h1 className="text-2xl font-bold tracking-tight text-[var(--nestora-forest)]">Movement log</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Gate exits and returns for your assigned hostel(s).</p>
        </div>
        <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => refresh()} disabled={loading}>
          {loading || isRefreshing ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
          Refresh
        </Button>
      </header>

      {loading && !desk ? <Skeleton className="h-48 rounded-2xl" /> : null}

      {desk && desk.recentMovements.length === 0 ? (
        <p className="rounded-2xl border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
          No gate movements logged yet.
        </p>
      ) : null}

      {desk && desk.recentMovements.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-x-auto rounded-xl border border-border bg-card"
        >
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Pass</th>
                <th className="px-4 py-3 font-medium">Room</th>
                <th className="px-4 py-3 font-medium">Exit</th>
                <th className="px-4 py-3 font-medium">Return</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {desk.recentMovements.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{row.studentName}</p>
                    <p className="text-xs text-muted-foreground">{row.registrationNumber}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{row.passToken}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{row.roomBed}</td>
                  <td className="px-4 py-3 text-xs">{formatWhen(row.actualDeparture)}</td>
                  <td className="px-4 py-3 text-xs">{formatWhen(row.actualReturn)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={row.status === 'out' ? 'default' : 'outline'}>
                      {row.status === 'out' ? 'Out' : row.isLateReturn ? 'Late' : 'Returned'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      ) : null}
    </div>
  );
}