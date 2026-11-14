'use client';

import { Building2, Loader2, RefreshCw, RotateCcw, Search, UserPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { StaffDashboardLiveStatus } from '@/components/dashboard/staff-portal/home/staff-dashboard-live-status';
import { useStaffShell } from '@/components/dashboard/staff-portal/staff-shell-provider';
import { VISITOR_STATUS_FILTERS } from '@/components/dashboard/visitors/visitor-desk-data';
import { WardenVisitorsDirectory } from '@/components/dashboard/warden/visitors/warden-visitors-directory';
import { WardenVisitorsRegisterSheet } from '@/components/dashboard/warden/visitors/warden-visitors-register-sheet';
import { WardenVisitorsStatsStrip } from '@/components/dashboard/warden/visitors/warden-visitors-stats-strip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOperationalDashboardOverview } from '@/hooks/use-operational-dashboard-overview';
import { useVisitorDesk } from '@/hooks/use-visitor-desk';
import {
  approveVisitor,
  checkInVisitor,
  checkOutVisitor,
  rejectVisitor,
} from '@/lib/api/visitors';
import { formatRelativeTimeFromIso } from '@/lib/format-relative-time';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

export function StaffVisitorsPage() {
  const { workplaceName } = useStaffShell();
  const { overview } = useOperationalDashboardOverview('HOSTEL_STAFF');

  const hostelScope = useMemo(() => {
    if (workplaceName && workplaceName !== 'Assigned hostel' && workplaceName !== 'No hostel assigned') {
      return workplaceName.split(' · ')[0]!;
    }
    const names = overview?.scope.hostelNames ?? [];
    return names[0] ?? 'All Hostels';
  }, [overview?.scope.hostelNames, workplaceName]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [registerOpen, setRegisterOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filters = useMemo(
    () => ({ q: search, hostel: hostelScope, status: statusFilter }),
    [search, hostelScope, statusFilter],
  );

  const { summary, records, loadingSummary, loadingList, error, refresh, patchRecord } = useVisitorDesk(filters, {
    pollIntervalMs: 20_000,
    summaryHostel: hostelScope,
  });

  const liveLabel = summary?.generatedAt ? formatRelativeTimeFromIso(summary.generatedAt) : null;
  const loading = loadingSummary && loadingList && !summary && records.length === 0;

  const runAction = async (
    id: string,
    action: () => Promise<{ record?: { id: string }; error?: string }>,
    success: string,
  ) => {
    setBusyId(id);
    const result = await action();
    setBusyId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    if (result.record) {
      patchRecord(id, result.record as never);
    }
    toast.success(success);
    void refresh();
  };

  return (
    <div className="space-y-6 pb-4">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--nestora-forest)] sm:text-2xl">Visitor &amp; Security Log</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Live gate log for your assigned hostel — approve guests, check visitors in and out, and register walk-ins.
            Refreshes every 20 seconds.
          </p>
          <Badge variant="outline" className="mt-2 gap-1.5 font-semibold text-[var(--nestora-forest)]">
            <Building2 className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
            {hostelScope}
          </Badge>
          {liveLabel ? (
            <p className="mt-1 text-xs text-muted-foreground">Last sync {liveLabel}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn('gap-2', focusRing)}
            disabled={loadingSummary && loadingList}
            onClick={() => refresh()}
          >
            <RefreshCw className={cn('size-4', loadingSummary && 'animate-spin')} aria-hidden />
            Refresh
          </Button>
          <Button
            type="button"
            size="sm"
            className={cn('gap-2 bg-[var(--nestora-forest)] text-white', focusRing)}
            onClick={() => setRegisterOpen(true)}
          >
            <UserPlus className="size-4" aria-hidden />
            Register visitor
          </Button>
        </div>
      </header>

      <StaffDashboardLiveStatus
        loading={loading}
        error={error}
        refresh={refresh}
        hasOverview={summary != null || records.length > 0}
      />

      <WardenVisitorsStatsStrip summary={summary} loading={loadingSummary} />

      <section className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr,auto,auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Visitor, resident, purpose…"
              className={cn('h-10 rounded-xl pl-9', focusRing)}
            />
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={cn('h-10 rounded-xl border bg-card px-3 text-sm', focusRing)}
          >
            {VISITOR_STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-10 rounded-xl"
            onClick={() => {
              setSearch('');
              setStatusFilter('All Status');
            }}
          >
            <RotateCcw className="size-3.5" aria-hidden />
            Reset
          </Button>
        </div>
      </section>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" aria-hidden />
          Loading visitor log…
        </div>
      ) : records.length === 0 ? (
        <p className="rounded-2xl border border-dashed bg-card px-4 py-12 text-center text-sm text-muted-foreground">
          No visitor records for this filter. Register a guest or wait for student pre-registrations.
        </p>
      ) : (
        <WardenVisitorsDirectory
          rows={records}
          busyId={busyId}
          onApprove={(id) => void runAction(id, () => approveVisitor(id), 'Visitor approved.')}
          onReject={(id) => void runAction(id, () => rejectVisitor(id), 'Visitor rejected.')}
          onCheckIn={(id) => void runAction(id, () => checkInVisitor(id), 'Visitor checked in.')}
          onCheckOut={(id) => void runAction(id, () => checkOutVisitor(id), 'Visitor checked out.')}
        />
      )}

      <WardenVisitorsRegisterSheet
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        hostel={hostelScope}
        onRegistered={() => void refresh()}
      />
    </div>
  );
}