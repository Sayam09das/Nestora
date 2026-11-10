'use client';

import { useReducedMotion } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';

import { AdminFeesDesk } from '@/components/dashboard/fees/admin-fees-desk';
import { AdminFeesFiltersBar } from '@/components/dashboard/fees/admin-fees-filters-bar';
import { AdminFeesLedgerPanel } from '@/components/dashboard/fees/admin-fees-ledger-panel';
import { AdminFeesPageHeader } from '@/components/dashboard/fees/admin-fees-page-header';
import { AdminFeesRecordDrawer } from '@/components/dashboard/fees/admin-fees-record-drawer';
import { AdminFeesRegistry } from '@/components/dashboard/fees/admin-fees-registry';
import { AdminFeesStatsStrip } from '@/components/dashboard/fees/admin-fees-stats-strip';
import { AdminFeesWaiverDrawer } from '@/components/dashboard/fees/admin-fees-waiver-drawer';
import {
  DEFAULT_LEDGER_ID,
  SAMPLE_LEDGER_ACCOUNTS,
} from '@/components/dashboard/fees/admin-fees-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';

export function AdminFeesPage() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const flipRootRef = useRef<HTMLDivElement>(null);

  const [view, setView] = useState<'desk' | 'registry'>('desk');
  const [recordOpen, setRecordOpen] = useState(false);
  const [waiverOpen, setWaiverOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [hostelFilter, setHostelFilter] = useState('All hostels');
  const [statusFilter, setStatusFilter] = useState('All status');
  const [selectedId, setSelectedId] = useState(DEFAULT_LEDGER_ID);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SAMPLE_LEDGER_ACCOUNTS.filter((row) => {
      if (hostelFilter !== 'All hostels' && row.hostel !== hostelFilter) return false;
      if (statusFilter !== 'All status' && row.status !== statusFilter) return false;
      if (!q) return true;
      return (
        row.studentName.toLowerCase().includes(q) ||
        row.regNo.toLowerCase().includes(q) ||
        row.code.toLowerCase().includes(q) ||
        row.room.toLowerCase().includes(q)
      );
    });
  }, [search, hostelFilter, statusFilter]);

  const selected =
    filtered.find((a) => a.id === selectedId) ??
    filtered[0] ??
    SAMPLE_LEDGER_ACCOUNTS.find((a) => a.id === DEFAULT_LEDGER_ID) ??
    null;
  const effectiveSelectedId = selected?.id ?? selectedId;
  const listKey = `${search}|${hostelFilter}|${statusFilter}|${view}`;

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
      />
      <AdminFeesStatsStrip />
      <AdminFeesFiltersBar
        search={search}
        onSearchChange={setSearch}
        hostelFilter={hostelFilter}
        onHostelFilterChange={setHostelFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onReset={reset}
      />
      <div ref={flipRootRef} className="space-y-6">
        <AdminFeesDesk
          accounts={filtered}
          selectedId={effectiveSelectedId}
          onSelect={setSelectedId}
          listKey={listKey}
          hidden={view !== 'desk'}
        />
        <AdminFeesRegistry rows={filtered} hidden={view !== 'registry'} />
        {view === 'desk' ? (
          <AdminFeesLedgerPanel account={selected} onRequestWaiver={() => setWaiverOpen(true)} />
        ) : null}
      </div>
      <AdminFeesRecordDrawer open={recordOpen} onOpenChange={setRecordOpen} preselectAccountId={effectiveSelectedId} />
      <AdminFeesWaiverDrawer open={waiverOpen} onOpenChange={setWaiverOpen} />
    </div>
  );
}
