'use client';

import { useReducedMotion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { AdminFeesDesk } from '@/components/dashboard/fees/admin-fees-desk';
import { AdminFeesFiltersBar } from '@/components/dashboard/fees/admin-fees-filters-bar';
import { AdminFeesLedgerPanel } from '@/components/dashboard/fees/admin-fees-ledger-panel';
import { AdminFeesPageHeader } from '@/components/dashboard/fees/admin-fees-page-header';
import { AdminFeesRecordDrawer } from '@/components/dashboard/fees/admin-fees-record-drawer';
import { AdminFeesRegistry } from '@/components/dashboard/fees/admin-fees-registry';
import { AdminFeesStatsStrip } from '@/components/dashboard/fees/admin-fees-stats-strip';
import { AdminFeesProposeWaiverDrawer } from '@/components/dashboard/fees/admin-fees-propose-waiver-drawer';
import { AdminFeesWaiverDrawer } from '@/components/dashboard/fees/admin-fees-waiver-drawer';
import {
  ADMIN_FINANCE_DESK,
  type FinanceDeskConfig,
} from '@/components/dashboard/fees/finance-desk-config';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Button } from '@/components/ui/button';
import { useFinanceDesk } from '@/hooks/use-finance-desk';

export function AdminFeesPage({ desk = ADMIN_FINANCE_DESK }: { desk?: FinanceDeskConfig }) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const flipRootRef = useRef<HTMLDivElement>(null);

  const [view, setView] = useState<'desk' | 'registry'>('desk');
  const [recordOpen, setRecordOpen] = useState(false);
  const [waiverDecideOpen, setWaiverDecideOpen] = useState(false);
  const [waiverProposeOpen, setWaiverProposeOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [hostelFilter, setHostelFilter] = useState('All hostels');
  const [statusFilter, setStatusFilter] = useState('All status');
  const [selectedId, setSelectedId] = useState('');
  const pageSize = 48;

  const filters = useMemo(
    () => ({
      q: search,
      hostel: hostelFilter,
      status: statusFilter,
      page: 1,
      limit: pageSize,
    }),
    [search, hostelFilter, statusFilter],
  );

  const {
    summary,
    ledgers,
    collectionTrend,
    loadingSummary,
    loadingList,
    error,
    refresh,
    loadDetail,
    detailLines,
    detailWaivers,
    loadingDetail,
  } = useFinanceDesk(filters);

  const facetHostels = useMemo(() => {
    const hostels = summary?.facets.hostels ?? [];
    return ['All hostels', ...hostels] as const;
  }, [summary?.facets.hostels]);

  const selected = ledgers.find((a) => a.id === selectedId) ?? ledgers[0] ?? null;
  const effectiveSelectedId = selected?.id ?? selectedId;

  useEffect(() => {
    if (!effectiveSelectedId && ledgers[0]) {
      setSelectedId(ledgers[0].id);
    }
  }, [ledgers, effectiveSelectedId]);

  useEffect(() => {
    if (effectiveSelectedId) {
      void loadDetail(effectiveSelectedId);
    }
  }, [effectiveSelectedId, loadDetail]);

  const listKey = `${search}|${hostelFilter}|${statusFilter}|${view}|${ledgers.length}`;

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-fee-reveal]'), {
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
    setHostelFilter('All hostels');
    setStatusFilter('All status');
  };

  return (
    <div ref={rootRef} className="space-y-6 pb-6">
      <AdminFeesPageHeader
        onRecordPayment={() => setRecordOpen(true)}
        view={view}
        onViewChange={setView}
        flipRootRef={flipRootRef}
        summary={summary}
        loading={loadingSummary}
      />
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
      <AdminFeesStatsStrip summary={summary} loading={loadingSummary} />
      <AdminFeesFiltersBar
        search={search}
        onSearchChange={setSearch}
        hostelFilter={hostelFilter}
        onHostelFilterChange={setHostelFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onReset={reset}
        hostelOptions={facetHostels}
      />
      <div ref={flipRootRef} className="space-y-6">
        {loadingList && ledgers.length === 0 ? (
          <div className="flex min-h-[30vh] items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-5 animate-spin text-[var(--nestora-sage)]" aria-hidden />
            Loading ledgers…
          </div>
        ) : (
          <>
            <AdminFeesDesk
              accounts={ledgers}
              selectedId={effectiveSelectedId}
              onSelect={setSelectedId}
              listKey={listKey}
              hidden={view !== 'desk'}
              activeSchedules={summary?.activeSchedules ?? null}
              ledgerBasePath={desk.ledgerBasePath}
            />
            <AdminFeesRegistry rows={ledgers} hidden={view !== 'registry'} ledgerBasePath={desk.ledgerBasePath} />
          </>
        )}
        {view === 'desk' ? (
          <AdminFeesLedgerPanel
            account={selected}
            onDecideWaiver={desk.canDecideWaivers ? () => setWaiverDecideOpen(true) : undefined}
            onProposeWaiver={desk.canProposeWaivers ? () => setWaiverProposeOpen(true) : undefined}
            lines={detailLines}
            collectionTrend={collectionTrend}
            pendingWaivers={detailWaivers}
            loadingDetail={loadingDetail}
            ledgerBasePath={desk.ledgerBasePath}
          />
        ) : null}
      </div>
      <AdminFeesRecordDrawer
        open={recordOpen}
        onOpenChange={setRecordOpen}
        preselectAccountId={effectiveSelectedId}
        ledgers={ledgers}
        onRecorded={() => void refresh()}
      />
      <AdminFeesWaiverDrawer
        open={waiverDecideOpen}
        onOpenChange={setWaiverDecideOpen}
        pendingWaivers={detailWaivers}
        onDecided={() => void refresh()}
      />
      <AdminFeesProposeWaiverDrawer
        open={waiverProposeOpen}
        onOpenChange={setWaiverProposeOpen}
        account={selected}
        onSubmitted={() => {
          void refresh();
          if (effectiveSelectedId) void loadDetail(effectiveSelectedId);
        }}
      />
    </div>
  );
}
