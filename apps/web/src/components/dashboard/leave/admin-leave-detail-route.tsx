'use client';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { AdminLeaveDetailPage } from '@/components/dashboard/leave/admin-leave-detail-page';
import type { LeaveRecord, LeaveTimelineEntry } from '@/components/dashboard/leave/admin-leave-data';
import { fetchLeaveDeskApplication } from '@/lib/api/leaves';
import { Button } from '@/components/ui/button';

export function AdminLeaveDetailRoute({ leaveId }: { leaveId: string }) {
  const [record, setRecord] = useState<LeaveRecord | null>(null);
  const [timeline, setTimeline] = useState<LeaveTimelineEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const result = await fetchLeaveDeskApplication(leaveId);
      if (cancelled) return;
      if (result.application) {
        setRecord(result.application);
        setTimeline(result.timeline ?? []);
        setError(null);
      } else {
        setError(result.error ?? 'Leave application not found.');
        setRecord(null);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [leaveId]);

  if (loading) {
    return (
      <LoadingShell>
        <Loader2 className="size-8 animate-spin text-[var(--nestora-sage)]" aria-hidden />
        <p className="text-sm text-muted-foreground">Loading leave application…</p>
      </LoadingShell>
    );
  }

  if (error || !record) {
    return (
      <LoadingShell>
        <p className="text-sm text-destructive">{error ?? 'Leave application not found.'}</p>
        <Button nativeButton={false} variant="outline" className="rounded-xl" render={<Link href="/admin/leave">Back to desk</Link>} />
      </LoadingShell>
    );
  }

  return <AdminLeaveDetailPage record={record} timeline={timeline} />;
}

function LoadingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">{children}</div>
  );
}
