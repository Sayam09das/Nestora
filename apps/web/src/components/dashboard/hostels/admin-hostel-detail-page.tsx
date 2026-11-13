'use client';

import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { AdminHostelsDetailPage } from '@/components/dashboard/hostels/admin-hostels-detail-page';
import type { HostelRecord } from '@/components/dashboard/hostels/admin-hostels-data';
import { Button } from '@/components/ui/button';
import { fetchHostelDirectoryById } from '@/lib/api/hostels';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type AdminHostelDetailPageProps = {
  hostelId: string;
};

export function AdminHostelDetailPage({ hostelId }: AdminHostelDetailPageProps) {
  const [record, setRecord] = useState<HostelRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const result = await fetchHostelDirectoryById(hostelId);
    if (result.hostel) {
      setRecord(result.hostel);
    } else {
      setRecord(null);
      setError(result.error ?? 'Hostel not found.');
    }
    setLoading(false);
  }, [hostelId]);

  useEffect(() => {
    setLoading(true);
    void load();
    const interval = setInterval(() => {
      void load();
    }, 20_000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading && !record) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-[var(--nestora-sage)]" aria-hidden />
        Loading hostel details…
      </div>
    );
  }

  if (!record) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-12 text-center">
        <p className="text-sm text-destructive">{error ?? 'This hostel could not be found.'}</p>
        <Button
          nativeButton={false}
          variant="outline"
          className="rounded-xl"
          render={<Link href="/admin/hostels" className={focusRing} />}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to hostels
        </Button>
      </div>
    );
  }

  return <AdminHostelsDetailPage record={record} />;
}
