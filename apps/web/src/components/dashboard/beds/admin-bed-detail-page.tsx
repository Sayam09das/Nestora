'use client';

import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { AdminBedsDetailPage } from '@/components/dashboard/beds/admin-beds-detail-page';
import type { BedRecord } from '@/components/dashboard/beds/admin-beds-data';
import { Button } from '@/components/ui/button';
import { fetchBedDirectoryById } from '@/lib/api/beds';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type AdminBedDetailPageProps = {
  bedId: string;
};

export function AdminBedDetailPage({ bedId }: AdminBedDetailPageProps) {
  const [bed, setBed] = useState<BedRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const result = await fetchBedDirectoryById(bedId);
    if (result.bed) {
      setBed(result.bed);
    } else {
      setBed(null);
      setError(result.error ?? 'Bed not found.');
    }
    setLoading(false);
  }, [bedId]);

  useEffect(() => {
    setLoading(true);
    void load();
    const interval = setInterval(() => {
      void load();
    }, 20_000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading && !bed) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-[var(--nestora-sage)]" aria-hidden />
        Loading bed details…
      </div>
    );
  }

  if (!bed) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-12 text-center">
        <p className="text-sm text-destructive">{error ?? 'This bed could not be found.'}</p>
        <Button
          nativeButton={false}
          variant="outline"
          className="rounded-xl"
          render={<Link href="/admin/rooms/beds" className={focusRing} />}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to bed inventory
        </Button>
      </div>
    );
  }

  return <AdminBedsDetailPage bed={bed} />;
}
