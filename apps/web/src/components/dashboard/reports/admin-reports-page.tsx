'use client';

import { useReducedMotion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { AdminReportsCatalog } from '@/components/dashboard/reports/admin-reports-catalog';
import { AdminReportsExportDrawer } from '@/components/dashboard/reports/admin-reports-export-drawer';
import { AdminReportsFiltersBar } from '@/components/dashboard/reports/admin-reports-filters-bar';
import { AdminReportsPageHeader } from '@/components/dashboard/reports/admin-reports-page-header';
import { AdminReportsPreviewPanel } from '@/components/dashboard/reports/admin-reports-preview-panel';
import { AdminReportsRegistry } from '@/components/dashboard/reports/admin-reports-registry';
import { AdminReportsStatsStrip } from '@/components/dashboard/reports/admin-reports-stats-strip';
import { DEFAULT_PREVIEW_ID } from '@/components/dashboard/reports/admin-reports-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Button } from '@/components/ui/button';
import { useReportsDesk } from '@/hooks/use-reports-desk';

export function AdminReportsPage() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const flipRootRef = useRef<HTMLDivElement>(null);

  const [view, setView] = useState<'catalog' | 'registry'>('catalog');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [hostelFilter, setHostelFilter] = useState('All Hostels');
  const [periodFilter, setPeriodFilter] = useState('Last 30 days');
  const [selectedId, setSelectedId] = useState(DEFAULT_PREVIEW_ID);

  const filters = useMemo(
    () => ({
      q: search,
      category: categoryFilter,
      hostel: hostelFilter,
      period: periodFilter,
    }),
    [search, categoryFilter, hostelFilter, periodFilter],
  );

  const { summary, templates, preview, loadingSummary, loadingList, loadingPreview, error, refresh } = useReportsDesk(
    filters,
    selectedId,
  );

  const hostelOptions = useMemo(() => {
    const hostels = summary?.facets.hostels ?? [];
    return ['All Hostels', ...hostels] as const;
  }, [summary?.facets.hostels]);

  const filtered = templates;
  const selected = filtered.find((r) => r.id === selectedId) ?? filtered[0] ?? null;
  const effectiveSelectedId = selected?.id ?? selectedId;

  useEffect(() => {
    if (!templates.length) return;
    if (!templates.some((t) => t.id === selectedId)) {
      setSelectedId(templates[0]?.id ?? DEFAULT_PREVIEW_ID);
    }
  }, [templates, selectedId]);

  const listKey = `${search}|${categoryFilter}|${hostelFilter}|${periodFilter}|${view}|${filtered.length}`;

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-rpt-reveal]'), {
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
    setHostelFilter('All Hostels');
    setPeriodFilter('Last 30 days');
  };

  const loading = loadingSummary && loadingList && !summary && templates.length === 0;

  return (
    <div ref={rootRef} className="space-y-6 pb-6">
      <AdminReportsPageHeader
        onExport={() => setDrawerOpen(true)}
        view={view}
        onViewChange={setView}
        flipRootRef={flipRootRef}
        summary={summary}
        loading={loadingSummary}
      />
      <AdminReportsStatsStrip summary={summary} loading={loadingSummary} />
      {error ? <ErrorBanner error={error} onRetry={refresh} /> : null}
      <AdminReportsFiltersBar
        search={search}
        onSearchChange={setSearch}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        hostelFilter={hostelFilter}
        onHostelFilterChange={setHostelFilter}
        periodFilter={periodFilter}
        onPeriodFilterChange={setPeriodFilter}
        onReset={reset}
        hostelOptions={hostelOptions}
      />
      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border bg-card py-16 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-[var(--nestora-sage)]" aria-hidden />
          Loading report catalog…
        </div>
      ) : (
        <div ref={flipRootRef} className="space-y-6">
          <AdminReportsCatalog
            reports={filtered}
            selectedId={effectiveSelectedId}
            onSelect={setSelectedId}
            listKey={listKey}
            hidden={view !== 'catalog'}
          />
          <AdminReportsRegistry rows={filtered} hidden={view !== 'registry'} />
          {view === 'catalog' ? (
            <AdminReportsPreviewPanel report={selected} preview={preview} loadingPreview={loadingPreview} />
          ) : null}
        </div>
      )}
      <AdminReportsExportDrawer open={drawerOpen} onOpenChange={setDrawerOpen} preselectId={effectiveSelectedId} templates={templates} />
    </div>
  );
}

function ErrorBanner({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
      <p className="text-destructive">{error}</p>
      <Button type="button" size="sm" variant="outline" className="rounded-lg" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}
