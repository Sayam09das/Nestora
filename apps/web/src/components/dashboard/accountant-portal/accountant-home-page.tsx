'use client';

import { ArrowRight, CreditCard, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { fetchFinanceDeskSummary, type FinanceDeskSummary } from '@/lib/api/finance';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

export function AccountantHomePage() {
  const [summary, setSummary] = useState<FinanceDeskSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchFinanceDeskSummary().then((res) => {
      if (res.summary) setSummary(res.summary);
      else if (res.error) setError(res.error);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-[var(--nestora-forest)]">Finance overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">Live university ledger metrics and collection status.</p>
      </header>

      {loading ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading finance summary…
        </p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {summary ? (
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Collected this month', value: `₹${summary.collectedMonth.toLocaleString('en-IN')}` },
            { label: 'Outstanding total', value: `₹${summary.outstandingTotal.toLocaleString('en-IN')}` },
            { label: 'Pending approvals', value: String(summary.pendingApprovals) },
            { label: 'Active schedules', value: String(summary.activeSchedules) },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{item.label}</dt>
              <dd className="mt-2 text-xl font-semibold text-[var(--nestora-forest)]">{item.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <Link
        href="/accountant/fees"
        className={cn(
          'inline-flex items-center gap-2 rounded-full bg-[var(--nestora-forest)] px-4 py-2 text-sm font-semibold text-white',
          focusRing,
        )}
      >
        <CreditCard className="size-4" aria-hidden />
        Open fees desk
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}