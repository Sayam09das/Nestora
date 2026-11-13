'use client';

import { useReducedMotion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { AdminRolesFiltersBar } from '@/components/dashboard/roles/admin-roles-filters-bar';
import { AdminRolesGrantDrawer } from '@/components/dashboard/roles/admin-roles-grant-drawer';
import { AdminRolesHub } from '@/components/dashboard/roles/admin-roles-hub';
import { AdminRolesMatrixPanel } from '@/components/dashboard/roles/admin-roles-matrix-panel';
import { AdminRolesPageHeader } from '@/components/dashboard/roles/admin-roles-page-header';
import { AdminRolesRegistry } from '@/components/dashboard/roles/admin-roles-registry';
import { AdminRolesStatsStrip } from '@/components/dashboard/roles/admin-roles-stats-strip';
import { DEFAULT_ROLE_ID } from '@/components/dashboard/roles/admin-roles-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Button } from '@/components/ui/button';
import { useRolesDesk } from '@/hooks/use-roles-desk';

export function AdminRolesPage() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const flipRootRef = useRef<HTMLDivElement>(null);

  const [view, setView] = useState<'hub' | 'registry'>('hub');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('All tiers');
  const [scopeFilter, setScopeFilter] = useState('All scopes');
  const [riskFilter, setRiskFilter] = useState('All risk');
  const [selectedId, setSelectedId] = useState(DEFAULT_ROLE_ID);

  const filters = useMemo(
    () => ({
      q: search,
      tier: tierFilter,
      scope: scopeFilter,
      risk: riskFilter,
    }),
    [search, tierFilter, scopeFilter, riskFilter],
  );

  const { summary, roles, loadingSummary, loadingList, error, refresh } = useRolesDesk(filters);

  const selected = roles.find((r) => r.id === selectedId) ?? roles[0] ?? null;
  const effectiveSelectedId = selected?.id ?? selectedId;

  useEffect(() => {
    if (!roles.length) return;
    if (!roles.some((r) => r.id === selectedId)) {
      setSelectedId(roles[0]?.id ?? DEFAULT_ROLE_ID);
    }
  }, [roles, selectedId]);

  const listKey = `${search}|${tierFilter}|${scopeFilter}|${riskFilter}|${view}|${roles.length}`;

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-role-reveal]'), {
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
    setTierFilter('All tiers');
    setScopeFilter('All scopes');
    setRiskFilter('All risk');
  };

  const loading = loadingSummary && loadingList && !summary && roles.length === 0;

  return (
    <div ref={rootRef} className="space-y-6 pb-6">
      <AdminRolesPageHeader
        onGrant={() => setDrawerOpen(true)}
        view={view}
        onViewChange={setView}
        flipRootRef={flipRootRef}
        summary={summary}
        loading={loadingSummary}
      />
      <AdminRolesStatsStrip summary={summary} loading={loadingSummary} />
      {error ? <ErrorBanner error={error} onRetry={refresh} /> : null}
      <AdminRolesFiltersBar
        search={search}
        onSearchChange={setSearch}
        tierFilter={tierFilter}
        onTierFilterChange={setTierFilter}
        scopeFilter={scopeFilter}
        onScopeFilterChange={setScopeFilter}
        riskFilter={riskFilter}
        onRiskFilterChange={setRiskFilter}
        onReset={reset}
      />
      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border bg-card py-16 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-[var(--nestora-sage)]" aria-hidden />
          Loading access architecture…
        </div>
      ) : (
        <div ref={flipRootRef} className="space-y-6">
          <AdminRolesHub
            roles={roles}
            selectedId={effectiveSelectedId}
            onSelect={setSelectedId}
            listKey={listKey}
            hidden={view !== 'hub'}
          />
          <AdminRolesRegistry rows={roles} hidden={view !== 'registry'} />
          {view === 'hub' ? <AdminRolesMatrixPanel role={selected} /> : null}
        </div>
      )}
      <AdminRolesGrantDrawer open={drawerOpen} onOpenChange={setDrawerOpen} preselectId={effectiveSelectedId} roles={roles} />
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
