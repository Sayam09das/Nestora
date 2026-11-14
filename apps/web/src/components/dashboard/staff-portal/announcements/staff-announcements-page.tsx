'use client';

import { Building2, Loader2, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';

import { AdminAnnouncementsFeed } from '@/components/dashboard/announcements/admin-announcements-feed';
import { AdminAnnouncementsFiltersBar } from '@/components/dashboard/announcements/admin-announcements-filters-bar';
import { AdminAnnouncementsStatsStrip } from '@/components/dashboard/announcements/admin-announcements-stats-strip';
import type { AnnouncementRecord } from '@/components/dashboard/announcements/admin-announcements-data';
import { StaffDashboardLiveStatus } from '@/components/dashboard/staff-portal/home/staff-dashboard-live-status';
import { useStaffShell } from '@/components/dashboard/staff-portal/staff-shell-provider';
import { Badge } from '@/components/ui/badge';
import { useAnnouncementsDesk } from '@/hooks/use-announcements-desk';
import { useOperationalDashboardOverview } from '@/hooks/use-operational-dashboard-overview';
import { formatRelativeTimeFromIso } from '@/lib/format-relative-time';
import { cn } from '@/lib/utils';

const DETAIL_BASE = '/staff/announcements';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

function scopedNotices(notices: AnnouncementRecord[], hostelNames: string[]): AnnouncementRecord[] {
  if (hostelNames.length === 0) return notices;
  const scopes = new Set(hostelNames.map((name) => name.toLowerCase()));
  return notices.filter(
    (notice) => notice.scope === 'University-wide' || scopes.has(notice.scope.toLowerCase()),
  );
}

export function StaffAnnouncementsPage() {
  const { workplaceName } = useStaffShell();
  const { overview } = useOperationalDashboardOverview('HOSTEL_STAFF');

  const hostelNames = useMemo(() => {
    if (workplaceName && workplaceName !== 'Assigned hostel' && workplaceName !== 'No hostel assigned') {
      return workplaceName.split(' · ');
    }
    return overview?.scope.hostelNames ?? [];
  }, [overview?.scope.hostelNames, workplaceName]);

  const hostelScope = hostelNames[0] ?? 'All Hostels';

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('Live');

  const filters = useMemo(
    () => ({
      q: search,
      category: categoryFilter,
      scope: 'All Scopes',
      status: statusFilter,
    }),
    [search, categoryFilter, statusFilter],
  );

  const { summary, notices, loadingSummary, loadingList, error, refresh } = useAnnouncementsDesk(filters, {
    pollIntervalMs: 20_000,
    summaryScope: hostelScope !== 'All Hostels' ? hostelScope : undefined,
  });

  const visibleNotices = useMemo(() => scopedNotices(notices, hostelNames), [notices, hostelNames]);
  const listKey = `${search}|${categoryFilter}|${statusFilter}|${visibleNotices.length}`;
  const loading = loadingSummary && loadingList && !summary && notices.length === 0;
  const liveLabel = summary?.generatedAt ? formatRelativeTimeFromIso(summary.generatedAt) : null;

  const reset = () => {
    setSearch('');
    setCategoryFilter('All Categories');
    setStatusFilter('Live');
  };

  return (
    <div className="space-y-6 pb-4">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--nestora-forest)] sm:text-2xl">Announcements</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Live notices for your hostel and university-wide broadcasts. Refreshes every 20 seconds.
          </p>
          <Badge variant="outline" className="mt-2 gap-1.5 font-semibold text-[var(--nestora-forest)]">
            <Building2 className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
            {hostelNames.length > 0 ? hostelNames.join(' · ') : 'Assigned hostel'}
          </Badge>
          {liveLabel ? <p className="mt-1 text-xs text-muted-foreground">Last sync {liveLabel}</p> : null}
        </div>
        <button
          type="button"
          className={cn(
            'inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border bg-card px-3 text-sm font-medium shadow-sm',
            focusRing,
          )}
          disabled={loadingSummary && loadingList}
          onClick={() => refresh()}
        >
          <RefreshCw className={cn('size-4', loadingSummary && 'animate-spin')} aria-hidden />
          Refresh
        </button>
      </header>

      <StaffDashboardLiveStatus
        loading={loading}
        error={error}
        refresh={refresh}
        hasOverview={summary != null || visibleNotices.length > 0}
      />

      <AdminAnnouncementsStatsStrip summary={summary} loading={loadingSummary} />

      <AdminAnnouncementsFiltersBar
        search={search}
        onSearchChange={setSearch}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        scopeFilter={hostelScope}
        onScopeFilterChange={() => {}}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onReset={reset}
        showScopeFilter={false}
      />

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-[var(--nestora-sage)]" aria-hidden />
          Loading notices…
        </div>
      ) : visibleNotices.length === 0 ? (
        <p className="rounded-2xl border border-dashed bg-card px-4 py-12 text-center text-sm text-muted-foreground">
          No announcements match this filter for your hostel. Try &quot;All Status&quot; or check back later.
        </p>
      ) : (
        <AdminAnnouncementsFeed
          notices={visibleNotices}
          listKey={listKey}
          detailBasePath={DETAIL_BASE}
        />
      )}
    </div>
  );
}