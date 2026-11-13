'use client';

import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { AdminComplaintsDetailPage } from '@/components/dashboard/complaints/admin-complaints-detail-page';
import type {
  ComplaintTicket,
  ComplaintTimelineEntry,
} from '@/components/dashboard/complaints/admin-complaints-data';
import { Button } from '@/components/ui/button';
import { fetchComplaintDeskTicket } from '@/lib/api/complaints';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

export function AdminComplaintsDetailRoute({ ticketId }: { ticketId: string }) {
  const [ticket, setTicket] = useState<ComplaintTicket | null>(null);
  const [timeline, setTimeline] = useState<ComplaintTimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const result = await fetchComplaintDeskTicket(ticketId);
    if (result.ticket) {
      setTicket(result.ticket);
      setTimeline(result.timeline ?? []);
    } else {
      setTicket(null);
      setTimeline([]);
      setError(result.error ?? 'Ticket not found.');
    }
    setLoading(false);
  }, [ticketId]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-[var(--nestora-sage)]" aria-hidden />
        Loading ticket…
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-12 text-center">
        <p className="text-sm text-destructive">{error ?? 'This ticket could not be found.'}</p>
        <Button
          nativeButton={false}
          variant="outline"
          className="rounded-xl"
          render={<Link href="/admin/complaints" className={focusRing} />}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to command center
        </Button>
      </div>
    );
  }

  return <AdminComplaintsDetailPage ticket={ticket} timeline={timeline} />;
}
