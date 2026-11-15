'use client';

import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { AdminFeesDetailPage } from '@/components/dashboard/fees/admin-fees-detail-page';
import type { LedgerAccount, LedgerLine } from '@/components/dashboard/fees/admin-fees-data';
import {
  ADMIN_FINANCE_DESK,
  type FinanceDeskConfig,
} from '@/components/dashboard/fees/finance-desk-config';
import type { FinancePendingWaiver } from '@/lib/api/finance';
import { Button } from '@/components/ui/button';
import { fetchFinanceLedgerDetail } from '@/lib/api/finance';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

export function AdminFeesDetailRoute({
  ledgerId,
  backHref = '/admin/fees',
  desk = ADMIN_FINANCE_DESK,
}: {
  ledgerId: string;
  backHref?: string;
  desk?: FinanceDeskConfig;
}) {
  const [account, setAccount] = useState<LedgerAccount | null>(null);
  const [lines, setLines] = useState<LedgerLine[]>([]);
  const [pendingWaivers, setPendingWaivers] = useState<FinancePendingWaiver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const result = await fetchFinanceLedgerDetail(ledgerId);
    if (result.account) {
      setAccount(result.account);
      setLines(result.lines ?? []);
      setPendingWaivers(result.pendingWaivers ?? []);
    } else {
      setAccount(null);
      setLines([]);
      setPendingWaivers([]);
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
          render={<Link href={backHref} className={focusRing} />}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to finance desk
        </Button>
      </div>
    );
  }

  return (
    <AdminFeesDetailPage
      account={account}
      lines={lines}
      pendingWaivers={pendingWaivers}
      backHref={backHref}
      desk={desk}
      onLedgerUpdated={() => void load()}
    />
  );
}
