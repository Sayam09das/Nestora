'use client';

import { BookOpen, Building2, CalendarDays, Loader2, RotateCcw, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { WardenDailyRegisterStatsStrip } from '@/components/dashboard/warden/register/warden-daily-register-stats-strip';
import { WardenDailyRegisterTimeline } from '@/components/dashboard/warden/register/warden-daily-register-timeline';
import {
  getWardenHostelApiFilter,
  getWardenHostelDisplayName,
} from '@/components/dashboard/warden/students/warden-students-hostel';
import { useWardenShell } from '@/components/dashboard/warden/warden-shell-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDailyRegisterDesk } from '@/hooks/use-daily-register-desk';
import { useOperationalDashboardOverview } from '@/hooks/use-operational-dashboard-overview';
import { formatRelativeTimeFromIso } from '@/lib/format-relative-time';
import type { DailyRegisterCategory } from '@/lib/api/daily-register';
import { cn } from '@/lib/utils';

const CATEGORY_FILTERS = [
  'All Categories',
  'Attendance',
  'Movement',
  'Visitor',
  'Leave',
  'Complaint',
  'Incident',
] as const;

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

function todayIsoDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function WardenDailyRegisterPage() {
  const { selectedHostelId, assignedHostels } = useWardenShell();
  const scopedHostelId = assignedHostels.some((h) => h.id === selectedHostelId) ? selectedHostelId : undefined;
  const { overview } = useOperationalDashboardOverview('HOSTEL_WARDEN', { hostelId: scopedHostelId });
  const scopeHostelNames = overview?.scope.hostelNames ?? [];
  const hostelDisplay = getWardenHostelDisplayName(selectedHostelId, scopeHostelNames, assignedHostels);
  const hostelApiFilter = getWardenHostelApiFilter(selectedHostelId, scopeHostelNames, assignedHostels);
  const hostelScope =
    hostelApiFilter || (hostelDisplay !== 'No hostel assigned' ? hostelDisplay : 'All Hostels');

  const [registerDate, setRegisterDate] = useState(todayIsoDate);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All Categories');

  const filters = useMemo(
    () => ({
      date: registerDate,
      hostel: hostelScope,
      category: categoryFilter,
      q: search,
    }),
    [registerDate, hostelScope, categoryFilter, search],
  );

  const { summary, entries, loadingSummary, loadingList, error, refresh } = useDailyRegisterDesk(filters, {
    pollIntervalMs: 20_000,
  });

  const liveLabel = summary?.generatedAt ? formatRelativeTimeFromIso(summary.generatedAt) : null;
  const loading = loadingSummary && loadingList && !summary && entries.length === 0;
  const listKey = `${registerDate}|${hostelScope}|${categoryFilter}|${search}|${entries.length}`;

  const reset = () => {
    setRegisterDate(todayIsoDate());
    setSearch('');
    setCategoryFilter('All Categories');
  };

  return (
    <div className="space-y-6 pb-6">
      <header
        className={cn(
          'rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))]',
          'bg-[linear-gradient(135deg,color-mix(in_oklch,var(--nestora-cream)_48%,var(--card))_0%,var(--card)_62%)] p-5 shadow-sm sm:p-6',
        )}
      >
        <div className="space-y-2">
          <p className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--nestora-sage)]">
            <BookOpen className="size-3.5" aria-hidden />
            Hostel ledger · consolidated desk
            {liveLabel ? (
              <span className="rounded-full border px-2 py-0.5 text-[10px] font-semibold normal-case tracking-normal text-[var(--nestora-forest)]">
                Synced {liveLabel}
              </span>
            ) : null}
          </p>
          <h1 className="text-2xl font-semibold text-[var(--nestora-forest)]">Daily register</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Chronological log of attendance corrections, gate movements, visitors, leave, complaints, and incidents for
            your hostel — the digital replacement for the paper register.
          </p>
          <Badge variant="outline" className="gap-1.5 font-semibold text-[var(--nestora-forest)]">
            <Building2 className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
            {hostelDisplay}
          </Badge>
        </div>
      </header>

      <WardenDailyRegisterStatsStrip summary={summary} loading={loadingSummary} />

      {error ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <span>{error}</span>
          <Button type="button" size="sm" variant="outline" className="rounded-lg" onClick={refresh}>
            Retry
          </Button>
        </div>
      ) : null}

      <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">Filter register</h2>
          <Button type="button" variant="ghost" size="sm" className={cn('h-8 gap-1 rounded-lg text-xs', focusRing)} onClick={reset}>
            <RotateCcw className="size-3.5" aria-hidden />
            Reset
          </Button>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-[auto,1fr,auto]">
          <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <CalendarDays className="size-4 text-[var(--nestora-sage)]" aria-hidden />
            <input
              type="date"
              value={registerDate}
              onChange={(e) => setRegisterDate(e.target.value)}
              className={cn('h-10 rounded-xl border bg-card px-3 text-sm', focusRing)}
            />
          </label>
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resident, headline, location…"
              className={cn('h-10 rounded-xl pl-9', focusRing)}
            />
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={cn('h-10 min-w-[10rem] rounded-xl border bg-card px-2.5 text-sm', focusRing)}
          >
            {CATEGORY_FILTERS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        {summary ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Showing <span className="font-medium text-foreground">{entries.length}</span> of{' '}
            <span className="font-medium text-foreground">{summary.totalEntries}</span> events on{' '}
            <time dateTime={summary.registerDate}>{summary.registerDate}</time>
            {(['Complaint', 'Incident'] as DailyRegisterCategory[]).map((cat) =>
              summary.counts[cat] > 0 ? (
                <span key={cat}>
                  {' '}
                  · {summary.counts[cat]} {cat.toLowerCase()}
                  {summary.counts[cat] > 1 ? 's' : ''}
                </span>
              ) : null,
            )}
          </p>
        ) : null}
      </section>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border bg-card py-16 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-[var(--nestora-sage)]" aria-hidden />
          Loading daily register…
        </div>
      ) : (
        <WardenDailyRegisterTimeline entries={entries} listKey={listKey} />
      )}
    </div>
  );
}
