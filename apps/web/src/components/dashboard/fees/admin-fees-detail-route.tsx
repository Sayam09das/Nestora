'use client';

import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { AdminFeesDetailPage } from '@/components/dashboard/fees/admin-fees-detail-page';
import type { LedgerAccount } from '@/components/dashboard/fees/admin-fees-data';
import { Button } from '@/components/ui/button';
import { fetchFinanceLedgerDetail } from '@/lib/api/finance';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

export function AdminFeesDetailRoute({ ledgerId }: { ledgerId: string }) {
  const [account, setAccount] = useState<LedgerAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const result = await fetchFinanceLedgerDetail(ledgerId);
    if (result.account) {
      setAccount(result.account);
    } else {
      setAccount(null);
      setError(result.error ?? 'Ledger not found.');
    }
    setLoading(false);
  }, [ledgerId]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-[var(--nestora-sage)]" aria-hidden />
        Loading ledger…
      </div>
    );
  }

  if (!account) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-12 text-center">
        <p className="text-sm text-destructive">{error ?? 'This ledger could not be found.'}</p>
        <Button
          nativeButton={false}
          variant="outline"
          className="rounded-xl"
          render={<Link href="/admin/fees" className={focusRing} />}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to finance desk
        </Button>
      </div>
    );
  }

  return <AdminFeesDetailPage account={account} />;
}
