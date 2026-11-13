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
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Button } from '@/components/ui/button';
import { useAnnouncementsDesk } from '@/hooks/use-announcements-desk';

export function AdminAnnouncementsPage() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const flipRootRef = useRef<HTMLDivElement>(null);

  const [view, setView] = useState<'feed' | 'registry'>('feed');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [scopeFilter, setScopeFilter] = useState('All Scopes');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const filters = useMemo(
    () => ({
      q: search,
      category: categoryFilter,
      scope: scopeFilter,
      status: statusFilter,
    }),
    [search, categoryFilter, scopeFilter, statusFilter],
  );

  const { summary, notices, loadingSummary, loadingList, error, refresh } = useAnnouncementsDesk(filters);

  const facetScopes = useMemo(() => {
    const scopes = summary?.facets.scopes ?? [];
    return ['All Scopes', ...scopes] as const;
  }, [summary?.facets.scopes]);

  const listKey = `${search}|${categoryFilter}|${scopeFilter}|${statusFilter}|${view}|${notices.length}`;

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
    setScopeFilter('All Scopes');
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
      <AdminAnnouncementsStatsStrip summary={summary} loading={loadingSummary} />
      {error ? <ErrorBanner error={error} onRetry={refresh} /> : null}
      <AdminAnnouncementsFiltersBar
        search={search}
        onSearchChange={setSearch}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        scopeFilter={scopeFilter}
        onScopeFilterChange={setScopeFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onReset={reset}
        scopeOptions={facetScopes}
      />
      {loading ? (
        <LoadingState />
      ) : (
        <div ref={flipRootRef} data-ann-reveal>
          <AdminAnnouncementsFeed notices={notices} listKey={listKey} hidden={view !== 'feed'} />
          <AdminAnnouncementsList rows={notices} hidden={view !== 'registry'} />
        </div>
      )}
      <AdminAnnouncementsComposeDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
}

function ErrorBanner({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      <span>{error}</span>
      <Button type="button" size="sm" variant="outline" className="rounded-lg" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
      <Loader2 className="size-5 animate-spin" aria-hidden />
      Loading announcement studio…
    </div>
  );
}
