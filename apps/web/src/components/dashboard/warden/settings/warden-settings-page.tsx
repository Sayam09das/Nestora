'use client';

import { useReducedMotion } from 'framer-motion';
import { Building2, Loader2, Settings2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AdminSettingsFiltersBar } from '@/components/dashboard/settings/admin-settings-filters-bar';
import { AdminSettingsHub } from '@/components/dashboard/settings/admin-settings-hub';
import { AdminSettingsRegistry } from '@/components/dashboard/settings/admin-settings-registry';
import { AdminSettingsStatsStrip } from '@/components/dashboard/settings/admin-settings-stats-strip';
import { AdminSettingsTunePanel } from '@/components/dashboard/settings/admin-settings-tune-panel';
import {
  getWardenHostelApiFilter,
  getWardenHostelDisplayName,
} from '@/components/dashboard/warden/students/warden-students-hostel';
import { useWardenShell } from '@/components/dashboard/warden/warden-shell-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSettingsDesk } from '@/hooks/use-settings-desk';
import { useOperationalDashboardOverview } from '@/hooks/use-operational-dashboard-overview';
import { patchWardenSettingsPanel } from '@/lib/api/settings';
import { formatRelativeTimeFromIso } from '@/lib/format-relative-time';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';

const DETAIL_BASE = '/warden/settings';
const DEFAULT_WARDEN_PANEL = 'cfg-hostel-ops';

export function WardenSettingsPage() {
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

  const [view, setView] = useState<'hub' | 'registry'>('hub');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [scopeFilter, setScopeFilter] = useState('Hostel overrides');
  const [statusFilter, setStatusFilter] = useState('All status');
  const [selectedId, setSelectedId] = useState(DEFAULT_WARDEN_PANEL);

  const filters = useMemo(
    () => ({
      q: search,
      category: categoryFilter,
      scope: scopeFilter,
      status: statusFilter,
      hostel: hostelScope,
    }),
    [search, categoryFilter, scopeFilter, statusFilter, hostelScope],
  );

  const { summary, panels, tuneFields, loadingSummary, loadingList, loadingTune, error, refresh } = useSettingsDesk(
    filters,
    selectedId,
    { pollIntervalMs: 20_000, summaryHostel: hostelScope },
  );

  const selected = panels.find((p) => p.id === selectedId) ?? panels[0] ?? null;
  const effectiveSelectedId = selected?.id ?? selectedId;

  useEffect(() => {
    if (!panels.length) return;
    if (!panels.some((p) => p.id === selectedId)) {
      setSelectedId(panels.find((p) => p.id === DEFAULT_WARDEN_PANEL)?.id ?? panels[0]?.id ?? DEFAULT_WARDEN_PANEL);
    }
  }, [panels, selectedId]);

  const listKey = `${search}|${categoryFilter}|${hostelScope}|${statusFilter}|${view}|${panels.length}`;
  const liveLabel = summary?.generatedAt ? formatRelativeTimeFromIso(summary.generatedAt) : null;

  const onPersistField = useCallback(
    async (key: string, value: string | number | boolean) => {
      await patchWardenSettingsPanel(effectiveSelectedId, {
        hostel: hostelScope,
        fields: { [key]: value },
      });
      refresh();
    },
    [effectiveSelectedId, hostelScope, refresh],
  );

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
    setScopeFilter('Hostel overrides');
    setStatusFilter('All status');
  };

  const loading = loadingSummary && loadingList && !summary && panels.length === 0;

  return (
    <div ref={rootRef} className="space-y-6 pb-6">
      <header
        data-set-reveal
        className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] bg-[linear-gradient(135deg,color-mix(in_oklch,var(--nestora-cream)_48%,var(--card))_0%,var(--card)_62%)] p-5 shadow-sm sm:p-6"
      >
        <div className="space-y-2">
          <p className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--nestora-sage)]">
            <Settings2 className="size-3.5" aria-hidden />
            Hostel policy desk
            {liveLabel ? (
              <span className="rounded-full border px-2 py-0.5 text-[10px] font-semibold normal-case tracking-normal text-[var(--nestora-forest)]">
                Synced {liveLabel}
              </span>
            ) : null}
          </p>
          <h1 className="text-2xl font-semibold text-[var(--nestora-forest)]">Settings</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Operational policies for your assigned hostel — live counts for visitors, attendance disputes, incidents, and
            complaints. Notification preferences save instantly; university-wide policies stay read-only.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1.5 font-semibold text-[var(--nestora-forest)]">
              <Building2 className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
              {hostelDisplay}
            </Badge>
            <div
              role="group"
              aria-label="View mode"
              className="inline-flex rounded-xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card p-0.5"
            >
              {(['hub', 'registry'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setView(mode)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium ${
                    view === mode ? 'bg-[var(--nestora-forest)] text-white' : 'text-muted-foreground'
                  }`}
                >
                  {mode === 'hub' ? 'Policy hub' : 'Registry'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <AdminSettingsStatsStrip summary={summary} loading={loadingSummary} />
      {error ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
          <p className="text-destructive">{error}</p>
          <Button type="button" size="sm" variant="outline" className="rounded-lg" onClick={refresh}>
            Retry
          </Button>
        </div>
      ) : null}

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
          Loading policy panels…
        </div>
      ) : (
        <div ref={flipRootRef} className="space-y-6">
          <AdminSettingsHub
            panels={panels}
            selectedId={effectiveSelectedId}
            onSelect={setSelectedId}
            listKey={listKey}
            hidden={view !== 'hub'}
            detailBasePath={DETAIL_BASE}
          />
          <AdminSettingsRegistry rows={panels} hidden={view !== 'registry'} detailBasePath={DETAIL_BASE} />
          {view === 'hub' ? (
            <AdminSettingsTunePanel
              panel={selected}
              fields={tuneFields}
              loading={loadingTune}
              detailBasePath={DETAIL_BASE}
              onPersistField={onPersistField}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
