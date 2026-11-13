'use client';

import { useReducedMotion } from 'framer-motion';
import { BarChart3, Building2, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { AdminReportsCatalog } from '@/components/dashboard/reports/admin-reports-catalog';
import { AdminReportsExportDrawer } from '@/components/dashboard/reports/admin-reports-export-drawer';
import { AdminReportsFiltersBar } from '@/components/dashboard/reports/admin-reports-filters-bar';
import { AdminReportsPageHeader } from '@/components/dashboard/reports/admin-reports-page-header';
import { AdminReportsPreviewPanel } from '@/components/dashboard/reports/admin-reports-preview-panel';
import { AdminReportsRegistry } from '@/components/dashboard/reports/admin-reports-registry';
import { AdminReportsStatsStrip } from '@/components/dashboard/reports/admin-reports-stats-strip';
import {
  getWardenHostelApiFilter,
  getWardenHostelDisplayName,
} from '@/components/dashboard/warden/students/warden-students-hostel';
import { useWardenShell } from '@/components/dashboard/warden/warden-shell-provider';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useReportsDesk } from '@/hooks/use-reports-desk';
import { useOperationalDashboardOverview } from '@/hooks/use-operational-dashboard-overview';
import { formatRelativeTimeFromIso } from '@/lib/format-relative-time';

const DETAIL_BASE = '/warden/reports';
const DEFAULT_WARDEN_PREVIEW_ID = 'rpt-occupancy';

export function WardenReportsPage() {
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

  const [view, setView] = useState<'catalog' | 'registry'>('catalog');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [hostelFilter, setHostelFilter] = useState(hostelScope);
  const [periodFilter, setPeriodFilter] = useState('Last 30 days');
  const [selectedId, setSelectedId] = useState(DEFAULT_WARDEN_PREVIEW_ID);

  useEffect(() => {
    if (hostelScope && hostelScope !== 'No hostel assigned' && hostelScope !== 'All Hostels') {
      setHostelFilter(hostelScope);
    }
  }, [hostelScope]);

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
    { pollIntervalMs: 20_000 },
  );

  const visibleTemplates = useMemo(
    () => templates.filter((t) => t.hostelScoped || t.category !== 'Fees'),
    [templates],
  );

  const filtered = visibleTemplates;
  const selected = filtered.find((r) => r.id === selectedId) ?? filtered[0] ?? null;
  const effectiveSelectedId = selected?.id ?? selectedId;

  useEffect(() => {
    if (!filtered.length) return;
    if (!filtered.some((t) => t.id === selectedId)) {
      setSelectedId(filtered.find((t) => t.id === DEFAULT_WARDEN_PREVIEW_ID)?.id ?? filtered[0]?.id ?? DEFAULT_WARDEN_PREVIEW_ID);
    }
  }, [filtered, selectedId]);

  const listKey = `${search}|${categoryFilter}|${hostelFilter}|${periodFilter}|${view}|${filtered.length}`;

  const liveLabel = summary?.generatedAt ? formatRelativeTimeFromIso(summary.generatedAt) : null;

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
    setHostelFilter(hostelScope !== 'No hostel assigned' ? hostelScope : 'All Hostels');
    setPeriodFilter('Last 30 days');
  };

  const loading = loadingSummary && loadingList && !summary && templates.length === 0;

  return (
    <div ref={rootRef} className="space-y-6 pb-6">
      <header
        data-rpt-reveal
        className="relative overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] bg-[linear-gradient(135deg,color-mix(in_oklch,var(--nestora-cream)_52%,var(--card))_0%,var(--card)_60%)] p-5 shadow-sm sm:p-6"
      >
        <div className="flex flex-col gap-3">
          <p className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--nestora-sage)]">
            <BarChart3 className="size-3.5" aria-hidden />
            Operational intelligence · MOD-18
            {liveLabel ? (
              <span className="rounded-full border px-2 py-0.5 text-[10px] font-semibold normal-case tracking-normal text-[var(--nestora-forest)]">
                Synced {liveLabel}
              </span>
            ) : null}
          </p>
          <h1 className="text-2xl font-semibold text-[var(--nestora-forest)]">Reports &amp; analytics</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Live previews for occupancy, attendance, complaints, visitors, leave, and safety — scoped to your selected
            hostel. Data refreshes on a 20s cadence and when you refocus this tab.
          </p>
          <Badge variant="outline" className="w-fit gap-1.5 font-semibold text-[var(--nestora-forest)]">
            <Building2 className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
            {hostelDisplay}
          </Badge>
        </div>
      </header>

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
        showHostelFilter={false}
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
            detailBasePath={DETAIL_BASE}
          />
          <AdminReportsRegistry rows={filtered} hidden={view !== 'registry'} detailBasePath={DETAIL_BASE} />
          {view === 'catalog' ? (
            <AdminReportsPreviewPanel report={selected} preview={preview} loadingPreview={loadingPreview} />
          ) : null}
        </div>
      )}
      <AdminReportsExportDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        preselectId={effectiveSelectedId}
        templates={visibleTemplates}
      />
    </div>
  );
}

function ErrorBanner({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm"
    >
      <p className="text-destructive">{error}</p>
      <Button type="button" size="sm" variant="outline" className="rounded-lg" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}
