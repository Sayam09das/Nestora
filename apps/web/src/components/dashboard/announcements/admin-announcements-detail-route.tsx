'use client';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { AdminAnnouncementsDetailPage } from '@/components/dashboard/announcements/admin-announcements-detail-page';
import type { AnnouncementRecord } from '@/components/dashboard/announcements/admin-announcements-data';
import { fetchAnnouncementDeskNotice } from '@/lib/api/announcements';
import { Button } from '@/components/ui/button';

export function AdminAnnouncementsDetailRoute({ noticeId }: { noticeId: string }) {
  const [notice, setNotice] = useState<AnnouncementRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const result = await fetchAnnouncementDeskNotice(noticeId);
      if (cancelled) return;
      if (result.notice) {
        setNotice(result.notice);
        setError(null);
      } else {
        setError(result.error ?? 'Notice not found.');
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [noticeId]);

  if (loading) {
    return (
      <LoadingShell>
        <Loader2 className="size-8 animate-spin text-[var(--nestora-sage)]" aria-hidden />
        <p className="text-sm text-muted-foreground">Loading notice…</p>
      </LoadingShell>
    );
  }

  if (error || !notice) {
    return (
      <LoadingShell>
        <p className="text-sm text-destructive">{error ?? 'Notice not found.'}</p>
        <Button nativeButton={false} variant="outline" className="rounded-xl" render={<Link href="/admin/announcements">Back to studio</Link>} />
      </LoadingShell>
    );
  }

  return <AdminAnnouncementsDetailPage notice={notice} />;
}

function LoadingShell({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">{children}</div>;
}
