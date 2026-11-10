'use client';

import { useReducedMotion } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';

import { AdminSettingsFiltersBar } from '@/components/dashboard/settings/admin-settings-filters-bar';
import { AdminSettingsHub } from '@/components/dashboard/settings/admin-settings-hub';
import { AdminSettingsPageHeader } from '@/components/dashboard/settings/admin-settings-page-header';
import { AdminSettingsRegistry } from '@/components/dashboard/settings/admin-settings-registry';
import { AdminSettingsSaveDrawer } from '@/components/dashboard/settings/admin-settings-save-drawer';
import { AdminSettingsStatsStrip } from '@/components/dashboard/settings/admin-settings-stats-strip';
import { AdminSettingsTunePanel } from '@/components/dashboard/settings/admin-settings-tune-panel';
import { DEFAULT_PANEL_ID, SAMPLE_PANELS } from '@/components/dashboard/settings/admin-settings-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';

export function AdminSettingsPage() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const flipRootRef = useRef<HTMLDivElement>(null);

  const [view, setView] = useState<'hub' | 'registry'>('hub');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [scopeFilter, setScopeFilter] = useState('All scopes');
  const [statusFilter, setStatusFilter] = useState('All status');
  const [selectedId, setSelectedId] = useState(DEFAULT_PANEL_ID);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SAMPLE_PANELS.filter((row) => {
      if (categoryFilter !== 'All Categories' && row.category !== categoryFilter) return false;
      if (statusFilter !== 'All status' && row.status !== statusFilter) return false;
      if (scopeFilter === 'Hostel overrides' && row.category === 'Institution') return false;
      if (!q) return true;
      return (
        row.title.toLowerCase().includes(q) ||
        row.code.toLowerCase().includes(q) ||
        row.description.toLowerCase().includes(q) ||
        row.frRef.toLowerCase().includes(q)
      );
    });
  }, [search, categoryFilter, scopeFilter, statusFilter]);

  const selected =
    filtered.find((p) => p.id === selectedId) ?? filtered[0] ?? SAMPLE_PANELS.find((p) => p.id === DEFAULT_PANEL_ID) ?? null;
  const effectiveSelectedId = selected?.id ?? selectedId;
  const listKey = `${search}|${categoryFilter}|${scopeFilter}|${statusFilter}|${view}`;

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-set-reveal]'), {
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
    setScopeFilter('All scopes');
    setStatusFilter('All status');
  };

  return (
    <div ref={rootRef} className="space-y-6 pb-6">
      <AdminSettingsPageHeader
        onReviewSave={() => setDrawerOpen(true)}
        view={view}
        onViewChange={setView}
        flipRootRef={flipRootRef}
      />
      <AdminSettingsStatsStrip />
      <AdminSettingsFiltersBar
        search={search}
        onSearchChange={setSearch}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        scopeFilter={scopeFilter}
        onScopeFilterChange={setScopeFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onReset={reset}
      />
      <div ref={flipRootRef} className="space-y-6">
        <AdminSettingsHub
          panels={filtered}
          selectedId={effectiveSelectedId}
          onSelect={setSelectedId}
          listKey={listKey}
          hidden={view !== 'hub'}
        />
        <AdminSettingsRegistry rows={filtered} hidden={view !== 'registry'} />
        {view === 'hub' ? <AdminSettingsTunePanel panel={selected} /> : null}
      </div>
      <AdminSettingsSaveDrawer open={drawerOpen} onOpenChange={setDrawerOpen} preselectId={effectiveSelectedId} />
    </div>
  );
}
