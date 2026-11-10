'use client';

import { useReducedMotion } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';

import { AdminRolesFiltersBar } from '@/components/dashboard/roles/admin-roles-filters-bar';
import { AdminRolesGrantDrawer } from '@/components/dashboard/roles/admin-roles-grant-drawer';
import { AdminRolesHub } from '@/components/dashboard/roles/admin-roles-hub';
import { AdminRolesMatrixPanel } from '@/components/dashboard/roles/admin-roles-matrix-panel';
import { AdminRolesPageHeader } from '@/components/dashboard/roles/admin-roles-page-header';
import { AdminRolesRegistry } from '@/components/dashboard/roles/admin-roles-registry';
import { AdminRolesStatsStrip } from '@/components/dashboard/roles/admin-roles-stats-strip';
import { DEFAULT_ROLE_ID, SAMPLE_ROLES } from '@/components/dashboard/roles/admin-roles-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SAMPLE_ROLES.filter((row) => {
      if (tierFilter !== 'All tiers' && row.tier !== tierFilter) return false;
      if (scopeFilter !== 'All scopes' && row.scope !== scopeFilter) return false;
      if (riskFilter !== 'All risk' && row.risk !== riskFilter) return false;
      if (!q) return true;
      return (
        row.title.toLowerCase().includes(q) ||
        row.code.toLowerCase().includes(q) ||
        row.description.toLowerCase().includes(q) ||
        row.frRef.toLowerCase().includes(q)
      );
    });
  }, [search, tierFilter, scopeFilter, riskFilter]);

  const selected =
    filtered.find((r) => r.id === selectedId) ?? filtered[0] ?? SAMPLE_ROLES.find((r) => r.id === DEFAULT_ROLE_ID) ?? null;
  const effectiveSelectedId = selected?.id ?? selectedId;
  const listKey = `${search}|${tierFilter}|${scopeFilter}|${riskFilter}|${view}`;

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

  return (
    <div ref={rootRef} className="space-y-6 pb-6">
      <AdminRolesPageHeader onGrant={() => setDrawerOpen(true)} view={view} onViewChange={setView} flipRootRef={flipRootRef} />
      <AdminRolesStatsStrip />
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
      <div ref={flipRootRef} className="space-y-6">
        <AdminRolesHub
          roles={filtered}
          selectedId={effectiveSelectedId}
          onSelect={setSelectedId}
          listKey={listKey}
          hidden={view !== 'hub'}
        />
        <AdminRolesRegistry rows={filtered} hidden={view !== 'registry'} />
        {view === 'hub' ? <AdminRolesMatrixPanel role={selected} /> : null}
      </div>
      <AdminRolesGrantDrawer open={drawerOpen} onOpenChange={setDrawerOpen} preselectId={effectiveSelectedId} />
    </div>
  );
}
