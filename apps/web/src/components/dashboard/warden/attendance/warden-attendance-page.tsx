'use client';

import { Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { AdminAttendanceFiltersBar } from '@/components/dashboard/attendance/admin-attendance-filters-bar';
import { AdminAttendanceRoster } from '@/components/dashboard/attendance/admin-attendance-roster';
import { AdminAttendanceSessionsDirectory } from '@/components/dashboard/attendance/admin-attendance-sessions-directory';
import { AdminAttendanceStatsStrip } from '@/components/dashboard/attendance/admin-attendance-stats-strip';
import type { AttendanceMark } from '@/components/dashboard/attendance/admin-attendance-data';
import { WardenAttendanceHeader } from '@/components/dashboard/warden/attendance/warden-attendance-header';
import {
  deriveNightAttendanceSummary,
  scopeRosterToHostel,
  scopeSessionsToHostel,
} from '@/components/dashboard/warden/attendance/warden-attendance-scope';
import {
  getWardenHostelApiFilter,
  getWardenHostelDisplayName,
} from '@/components/dashboard/warden/students/warden-students-hostel';
import { useWardenShell } from '@/components/dashboard/warden/warden-shell-provider';
import { Button } from '@/components/ui/button';
import { useNightAttendance } from '@/hooks/use-night-attendance';
import { useOperationalDashboardOverview } from '@/hooks/use-operational-dashboard-overview';

function todayIsoDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function WardenAttendancePage() {
  const { selectedHostelId, assignedHostels } = useWardenShell();
  const scopedHostelId = assignedHostels.some((h) => h.id === selectedHostelId) ? selectedHostelId : undefined;
  const { overview } = useOperationalDashboardOverview('HOSTEL_WARDEN', { hostelId: scopedHostelId });
  const scopeHostelNames = overview?.scope.hostelNames ?? [];
  const hostelDisplay = getWardenHostelDisplayName(selectedHostelId, scopeHostelNames, assignedHostels);
  const hostelApiFilter = getWardenHostelApiFilter(selectedHostelId, scopeHostelNames, assignedHostels);
  const hostelScope =
    hostelApiFilter ||
    (hostelDisplay !== 'No hostel assigned' ? hostelDisplay : 'All Hostels');

  const [sessionDate, setSessionDate] = useState(todayIsoDate);
  const [search, setSearch] = useState('');
  const [blockFilter, setBlockFilter] = useState('All Blocks');
  const [floorFilter, setFloorFilter] = useState('All Floors');
  const [markFilter, setMarkFilter] = useState('All Marks');

  const { summary, roster, sessions, loading, error, applyMark, refresh } = useNightAttendance(sessionDate, {
    pollIntervalMs: 20_000,
  });

  const scopedRoster = useMemo(
    () => scopeRosterToHostel(roster, hostelScope),
    [roster, hostelScope],
  );
  const scopedSummary = useMemo(() => {
    if (!summary) return null;
    return deriveNightAttendanceSummary(summary, scopedRoster);
  }, [summary, scopedRoster]);
  const scopedSessions = useMemo(
    () => scopeSessionsToHostel(sessions, hostelScope),
    [sessions, hostelScope],
  );

  const facetOptions = useMemo(() => {
    const blocks = scopedSummary?.facets.blocks ?? [];
    const floors = scopedSummary?.facets.floors ?? [];
    return {
      blocks: ['All Blocks', ...blocks] as const,
      floors: ['All Floors', ...floors] as const,
    };
  }, [scopedSummary?.facets]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return scopedRoster.filter((row) => {
      if (blockFilter !== 'All Blocks' && row.block !== blockFilter) return false;
      if (floorFilter !== 'All Floors' && row.floor !== floorFilter) return false;
      if (markFilter !== 'All Marks' && row.mark !== markFilter) return false;
      if (!q) return true;
      return (
        row.studentName.toLowerCase().includes(q) ||
        row.studentId.toLowerCase().includes(q) ||
        row.roomNumber.toLowerCase().includes(q)
      );
    });
  }, [scopedRoster, search, blockFilter, floorFilter, markFilter]);

  const listKey = `${sessionDate}|${hostelScope}|${search}|${blockFilter}|${floorFilter}|${markFilter}|${scopedRoster.length}`;

  const reset = () => {
    setSearch('');
    setBlockFilter('All Blocks');
    setFloorFilter('All Floors');
    setMarkFilter('All Marks');
  };

  const onMarkChange = async (id: string, mark: AttendanceMark) => {
    const result = await applyMark(id, mark);
    if (!result.ok) {
      toast.error(result.error);
    }
  };

  const bulkFloorPresent = async () => {
    const floor = floorFilter !== 'All Floors' ? floorFilter : null;
    const block = blockFilter !== 'All Blocks' ? blockFilter : null;
    if (!floor || !block) {
      toast.message('Select a specific block and floor to bulk-mark present.');
      return;
    }
    const targets = scopedRoster.filter(
      (r) => r.block === block && r.floor === floor && !r.onApprovedLeave && r.mark !== 'Present',
    );
    if (!targets.length) {
      toast.message('No residents to update on this floor.');
      return;
    }
    let failed = 0;
    for (const row of targets) {
      const result = await applyMark(row.id, 'Present');
      if (!result.ok) failed += 1;
    }
    if (failed) {
      toast.error(`${failed} marks could not be saved.`);
    } else {
      toast.success(`${block} · ${floor} marked present.`);
    }
  };

  const publish = () => {
    const unmarked = scopedRoster.filter((r) => r.mark === 'Unmarked').length;
    if (unmarked > 0) {
      toast.error(`${unmarked} residents still unmarked.`);
      return;
    }
    toast.success('Roster ready to publish. Session totals are saved to attendance records.');
  };

  return (
    <div className="space-y-6 pb-6">
      <WardenAttendanceHeader
        hostelName={hostelDisplay}
        sessionDate={sessionDate}
        onSessionDateChange={setSessionDate}
        onPublish={publish}
        summary={scopedSummary}
        loading={loading}
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
      <AdminAttendanceStatsStrip summary={scopedSummary} loading={loading} />
      <AdminAttendanceFiltersBar
        search={search}
        onSearchChange={setSearch}
        hostelFilter={hostelScope}
        onHostelFilterChange={() => {}}
        blockFilter={blockFilter}
        onBlockFilterChange={setBlockFilter}
        floorFilter={floorFilter}
        onFloorFilterChange={setFloorFilter}
        markFilter={markFilter}
        onMarkFilterChange={setMarkFilter}
        onReset={reset}
        onBulkFloorPresent={() => void bulkFloorPresent()}
        hostelOptions={[hostelScope]}
        blockOptions={facetOptions.blocks}
        floorOptions={facetOptions.floors}
        showHostelFilter={false}
      />
      {loading && scopedRoster.length === 0 ? (
        <div className="flex min-h-[30vh] items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-[var(--nestora-sage)]" aria-hidden />
          Loading tonight&apos;s roster…
        </div>
      ) : (
        <AdminAttendanceRoster
          rows={filtered}
          onMarkChange={(id, mark) => void onMarkChange(id, mark)}
          listKey={listKey}
        />
      )}
      <AdminAttendanceSessionsDirectory sessions={scopedSessions} />
    </div>
  );
}
