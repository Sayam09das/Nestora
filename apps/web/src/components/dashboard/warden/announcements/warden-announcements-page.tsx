'use client';

import { useReducedMotion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

import { AdminAnnouncementsComposeDrawer } from '@/components/dashboard/announcements/admin-announcements-compose-drawer';
import { AdminAnnouncementsFeed } from '@/components/dashboard/announcements/admin-announcements-feed';
import { AdminAnnouncementsFiltersBar } from '@/components/dashboard/announcements/admin-announcements-filters-bar';
import { AdminAnnouncementsList } from '@/components/dashboard/announcements/admin-announcements-list';
import { AdminAnnouncementsPageHeader } from '@/components/dashboard/announcements/admin-announcements-page-header';
import { AdminAnnouncementsStatsStrip } from '@/components/dashboard/announcements/admin-announcements-stats-strip';
import {
  getWardenHostelApiFilter,
  getWardenHostelDisplayName,
} from '@/components/dashboard/warden/students/warden-students-hostel';
import { WardenAnnouncementsScopeBadge } from '@/components/dashboard/warden/announcements/warden-announcements-scope-badge';
import { useWardenShell } from '@/components/dashboard/warden/warden-shell-provider';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Button } from '@/components/ui/button';
import { useAnnouncementsDesk } from '@/hooks/use-announcements-desk';
import { useOperationalDashboardOverview } from '@/hooks/use-operational-dashboard-overview';

const DETAIL_BASE = '/warden/announcements';

export function WardenAnnouncementsPage() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const flipRootRef = useRef<HTMLDivElement>(null);

  const { selectedHostelId, assignedHostels } = useWardenShell();
  const scopedHostelId = assignedHostels.some((h) => h.id === selectedHostelId) ? selectedHostelId : undefined;
  const { overview } = useOperationalDashboardOverview('HOSTEL_WARDEN', { hostelId: scopedHostelId });
  const scopeHostelNames = overview?.scope.hostelNames ?? [];
  const hostelDisplay = getWardenHostelDisplayName(selectedHostelId, scopeHostelNames, assignedHostels);
  const hostelApiFilter = getWardenHostelApiFilter(selectedHostelId, scopeHostelNames, assignedHostels);
  const hostelScope =
    hostelApiFilter || (hostelDisplay !== 'No hostel assigned' ? hostelDisplay : 'All Hostels');

  const [view, setView] = useState<'feed' | 'registry'>('feed');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Status');

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
    summaryScope: hostelScope,
  });

  const listKey = `${search}|${categoryFilter}|${statusFilter}|${view}|${notices.length}`;

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-ann-reveal]'), {
        opacity: 0,
        y: 14,
        stagger: 0.06,
        duration: 0.4,
        clearProps: 'opacity,transform',
      });
    },
    { scope: rootRef, dependencies: [reduceMotion] },
  );

  const reset = () => {
    setSearch('');
    setCategoryFilter('All Categories');
    setStatusFilter('All Status');
  };

  const loading = loadingSummary && loadingList && !summary && notices.length === 0;

  return (
    <div ref={rootRef} className="space-y-6 pb-6">
      <AdminAnnouncementsPageHeader
        onCompose={() => setDrawerOpen(true)}
        view={view}
        onViewChange={setView}
        flipRootRef={flipRootRef}
        summary={summary}
        loading={loadingSummary}
      />
      <WardenAnnouncementsScopeBadge hostelName={hostelDisplay} />
      <AdminAnnouncementsStatsStrip summary={summary} loading={loadingSummary} />
      {error ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm"
        >
          <p className="text-destructive">{error}</p>
          <Button type="button" size="sm" variant="outline" className="rounded-lg" onClick={refresh}>
            Retry
          </Button>
        </div>
      ) : null}
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
      ) : (
        <div ref={flipRootRef} data-ann-reveal>
          <AdminAnnouncementsFeed
            notices={notices}
            listKey={listKey}
            hidden={view !== 'feed'}
            detailBasePath={DETAIL_BASE}
          />
          <AdminAnnouncementsList rows={notices} hidden={view !== 'registry'} detailBasePath={DETAIL_BASE} />
        </div>
      )}
      <AdminAnnouncementsComposeDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
}
