'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

type Props = {
  loading: boolean;
  error: string | null;
  refresh: () => void;
  hasOverview: boolean;
};

export function StaffDashboardLiveStatus({ loading, error, refresh, hasOverview }: Props) {
  if (!error && !(loading && !hasOverview)) return null;

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
          Loading your work overview…
        </span>
      )}
    </motion.div>
  );
}