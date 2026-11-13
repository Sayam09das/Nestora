'use client';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { AdminAuditLogsDetailPage } from '@/components/dashboard/audit-logs/admin-audit-logs-detail-page';
import { type AuditLogRow, fetchAuditLogById } from '@/lib/api/audit';
import { Button } from '@/components/ui/button';

export function AdminAuditLogsDetailRoute({ auditLogId }: { auditLogId: string }) {
  const [log, setLog] = useState<AuditLogRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const result = await fetchAuditLogById(auditLogId);
      if (cancelled) return;
      if (result.log) {
        setLog(result.log);
        setError(null);
      } else {
        setLog(null);
        setError(result.error ?? 'Audit entry not found.');
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [auditLogId]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-[var(--nestora-sage)]" aria-hidden />
        <p className="text-sm text-muted-foreground">Loading audit entry…</p>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="space-y-4 py-8 text-center">
        <p className="text-sm text-destructive">{error ?? 'Audit entry not found.'}</p>
        <Button nativeButton={false} variant="outline" className="rounded-xl" render={<Link href="/admin/audit-logs">Back to activity logs</Link>} />
      </div>
    );
  }

  return <AdminAuditLogsDetailPage log={log} />;
}
