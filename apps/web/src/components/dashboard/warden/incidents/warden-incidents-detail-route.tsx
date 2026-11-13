'use client';

import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { WardenIncidentsDetailPage } from '@/components/dashboard/warden/incidents/warden-incidents-detail-page';
import type { IncidentActionLogEntry, IncidentDeskRecord } from '@/components/dashboard/incidents/incident-desk-data';
import { Button } from '@/components/ui/button';
import { fetchIncidentDeskRecord } from '@/lib/api/incidents';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

export function WardenIncidentsDetailRoute({ incidentId }: { incidentId: string }) {
  const [record, setRecord] = useState<IncidentDeskRecord | null>(null);
  const [timeline, setTimeline] = useState<IncidentActionLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const result = await fetchIncidentDeskRecord(incidentId);
    if (result.record) {
      setRecord(result.record);
      setTimeline(result.timeline ?? []);
    } else {
      setRecord(null);
      setTimeline([]);
      setError(result.error ?? 'Incident not found.');
    }
    setLoading(false);
  }, [incidentId]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-[var(--nestora-sage)]" aria-hidden />
        Loading incident…
      </div>
    );
  }

  if (!record) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-12 text-center">
        <p className="text-sm text-destructive">{error ?? 'This incident could not be found.'}</p>
        <Button
          nativeButton={false}
          variant="outline"
          className="rounded-xl"
          render={<Link href="/warden/incidents" className={focusRing} />}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to incident desk
        </Button>
      </div>
    );
  }

  return (
    <WardenIncidentsDetailPage
      record={record}
      timeline={timeline}
      onRecordUpdated={(next) => {
        setRecord(next);
        void load();
      }}
    />
  );
}
