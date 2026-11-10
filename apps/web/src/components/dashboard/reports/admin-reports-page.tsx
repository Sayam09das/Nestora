'use client';

import { useReducedMotion } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';

import { AdminReportsCatalog } from '@/components/dashboard/reports/admin-reports-catalog';
import { AdminReportsExportDrawer } from '@/components/dashboard/reports/admin-reports-export-drawer';
import { AdminReportsFiltersBar } from '@/components/dashboard/reports/admin-reports-filters-bar';
import { AdminReportsPageHeader } from '@/components/dashboard/reports/admin-reports-page-header';
import { AdminReportsPreviewPanel } from '@/components/dashboard/reports/admin-reports-preview-panel';
import { AdminReportsRegistry } from '@/components/dashboard/reports/admin-reports-registry';
import { AdminReportsStatsStrip } from '@/components/dashboard/reports/admin-reports-stats-strip';
import { DEFAULT_PREVIEW_ID, SAMPLE_REPORTS } from '@/components/dashboard/reports/admin-reports-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SAMPLE_REPORTS.filter((row) => {
      if (categoryFilter !== 'All Categories' && row.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        row.title.toLowerCase().includes(q) ||
        row.code.toLowerCase().includes(q) ||
        row.description.toLowerCase().includes(q) ||
        row.frRef.toLowerCase().includes(q)
      );
    });
  }, [search, categoryFilter]);

  const selected = filtered.find((r) => r.id === selectedId) ?? filtered[0] ?? SAMPLE_REPORTS.find((r) => r.id === DEFAULT_PREVIEW_ID) ?? null;
  const effectiveSelectedId = selected?.id ?? selectedId;

  const listKey = `${search}|${categoryFilter}|${hostelFilter}|${periodFilter}|${view}`;

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

  return (
    <div ref={rootRef} className="space-y-6 pb-6">
      <AdminReportsPageHeader onExport={() => setDrawerOpen(true)} view={view} onViewChange={setView} flipRootRef={flipRootRef} />
      <AdminReportsStatsStrip />
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
      />
      <div ref={flipRootRef} className="space-y-6">
        <AdminReportsCatalog
          reports={filtered}
          selectedId={effectiveSelectedId}
          onSelect={setSelectedId}
          listKey={listKey}
          hidden={view !== 'catalog'}
        />
        <AdminReportsRegistry rows={filtered} hidden={view !== 'registry'} />
        {view === 'catalog' ? <AdminReportsPreviewPanel report={selected} /> : null}
      </div>
      <AdminReportsExportDrawer open={drawerOpen} onOpenChange={setDrawerOpen} preselectId={effectiveSelectedId} />
    </div>
  );
}
