'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { OperationalDashboardSession } from '@/hooks/use-operational-dashboard-overview';

type Props = Pick<OperationalDashboardSession, 'loading' | 'error' | 'refresh' | 'overview'>;

export function WardenDashboardLiveStatus({ loading, error, refresh, overview }: Props) {
  if (!error && !(loading && !overview)) return null;

  return (
    <motion.div
      role={error ? 'alert' : 'status'}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card px-4 py-2.5 text-sm shadow-sm"
    >
      {error ? (
        <>
          <span className="text-destructive">{error}</span>
          <Button type="button" size="sm" variant="outline" onClick={() => refresh()}>
            Retry live metrics
          </Button>
        </>
      ) : (
        <span className="inline-flex items-center gap-2 text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
          Loading assigned-hostel metrics…
        </span>
      )}
    </motion.div>
  );
}
