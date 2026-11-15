'use client';

import { useReducedMotion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AdminSettingsFiltersBar } from '@/components/dashboard/settings/admin-settings-filters-bar';
import { AdminSettingsHub } from '@/components/dashboard/settings/admin-settings-hub';
import { AdminSettingsPageHeader } from '@/components/dashboard/settings/admin-settings-page-header';
import { AdminSettingsRegistry } from '@/components/dashboard/settings/admin-settings-registry';
import { AdminSettingsSaveDrawer } from '@/components/dashboard/settings/admin-settings-save-drawer';
import { AdminSettingsStatsStrip } from '@/components/dashboard/settings/admin-settings-stats-strip';
import { AdminSettingsTunePanel } from '@/components/dashboard/settings/admin-settings-tune-panel';
import { DEFAULT_PANEL_ID } from '@/components/dashboard/settings/admin-settings-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Button } from '@/components/ui/button';
import { useSettingsDesk } from '@/hooks/use-settings-desk';
import { patchSettingsPanel } from '@/lib/api/settings';

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

  const filters = useMemo(
    () => ({
      q: search,
      category: categoryFilter,
      scope: scopeFilter,
      status: statusFilter,
    }),
    [search, categoryFilter, scopeFilter, statusFilter],
  );

  const { summary, panels, tuneFields, loadingSummary, loadingList, loadingTune, error, refresh } = useSettingsDesk(
    filters,
    selectedId,
  );

  const selected = panels.find((p) => p.id === selectedId) ?? panels[0] ?? null;
  const effectiveSelectedId = selected?.id ?? selectedId;

  useEffect(() => {
    if (!panels.length) return;
    if (!panels.some((p) => p.id === selectedId)) {
      setSelectedId(panels[0]?.id ?? DEFAULT_PANEL_ID);
    }
  }, [panels, selectedId]);

  const listKey = `${search}|${categoryFilter}|${scopeFilter}|${statusFilter}|${view}|${panels.length}`;

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

  const loading = loadingSummary && loadingList && !summary && panels.length === 0;

  const onPersistField = useCallback(
    async (key: string, value: string | number | boolean) => {
      await patchSettingsPanel(effectiveSelectedId, { fields: { [key]: value } });
      refresh();
    },
    [effectiveSelectedId, refresh],
  );

  return (
    <div ref={rootRef} className="space-y-6 pb-6">
      <AdminSettingsPageHeader
        onReviewSave={() => setDrawerOpen(true)}
        view={view}
        onViewChange={setView}
        flipRootRef={flipRootRef}
        summary={summary}
        loading={loadingSummary}
      />
      <AdminSettingsStatsStrip summary={summary} loading={loadingSummary} />
      {error ? <ErrorBanner error={error} onRetry={refresh} /> : null}
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
      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border bg-card py-16 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-[var(--nestora-sage)]" aria-hidden />
          Loading settings console…
        </div>
      ) : (
        <div ref={flipRootRef} className="space-y-6">
          <AdminSettingsHub
            panels={panels}
            selectedId={effectiveSelectedId}
            onSelect={setSelectedId}
            listKey={listKey}
            hidden={view !== 'hub'}
          />
          <AdminSettingsRegistry rows={panels} hidden={view !== 'registry'} />
          {view === 'hub' ? (
            <AdminSettingsTunePanel
              panel={selected}
              fields={tuneFields}
              loading={loadingTune}
              onPersistField={onPersistField}
            />
          ) : null}
        </div>
      )}
      <AdminSettingsSaveDrawer open={drawerOpen} onOpenChange={setDrawerOpen} preselectId={effectiveSelectedId} panels={panels} />
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
