'use client';

import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { AdminAllocationDetailPage } from '@/components/dashboard/allocation/admin-allocation-detail-page';
import type { AllocationRecord } from '@/components/dashboard/allocation/admin-allocation-data';
import { Button } from '@/components/ui/button';
import { fetchAllocationDirectoryById } from '@/lib/api/allocations';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type AdminAllocationDetailRouteProps = {
  allocationId: string;
};

export function AdminAllocationDetailRoute({ allocationId }: AdminAllocationDetailRouteProps) {
  const [record, setRecord] = useState<AllocationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const result = await fetchAllocationDirectoryById(allocationId);
    if (result.allocation) {
      setRecord(result.allocation);
    } else {
      setRecord(null);
      setError(result.error ?? 'Allocation record not found.');
    }
    setLoading(false);
  }, [allocationId]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-[var(--nestora-sage)]" aria-hidden />
        Loading allocation details…
      </div>
    );
  }

  if (!record) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-12 text-center">
        <p className="text-sm text-destructive">{error ?? 'This allocation could not be found.'}</p>
        <Button
          nativeButton={false}
          variant="outline"
          className="rounded-xl"
          render={<Link href="/admin/allocation" className={focusRing} />}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to room allocation
        </Button>
      </div>
    );
  }

  return <AdminAllocationDetailPage record={record} />;
}
