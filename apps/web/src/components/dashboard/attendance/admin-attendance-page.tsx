'use client';

import { useReducedMotion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { AdminAttendanceFiltersBar } from '@/components/dashboard/attendance/admin-attendance-filters-bar';
import { AdminAttendancePageHeader } from '@/components/dashboard/attendance/admin-attendance-page-header';
import { AdminAttendanceRoster } from '@/components/dashboard/attendance/admin-attendance-roster';
import { AdminAttendanceSessionsDirectory } from '@/components/dashboard/attendance/admin-attendance-sessions-directory';
import { AdminAttendanceStatsStrip } from '@/components/dashboard/attendance/admin-attendance-stats-strip';
import type { AttendanceMark } from '@/components/dashboard/attendance/admin-attendance-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Button } from '@/components/ui/button';
import { useNightAttendance } from '@/hooks/use-night-attendance';

function todayIsoDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function AdminAttendancePage() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);

  const [sessionDate, setSessionDate] = useState(todayIsoDate);
  const [search, setSearch] = useState('');
  const [hostelFilter, setHostelFilter] = useState('All Hostels');
  const [blockFilter, setBlockFilter] = useState('All Blocks');
  const [floorFilter, setFloorFilter] = useState('All Floors');
  const [markFilter, setMarkFilter] = useState('All Marks');

  const { summary, roster, sessions, loading, error, applyMark, refresh } = useNightAttendance(sessionDate);

  const facetOptions = useMemo(() => {
    const hostels = summary?.facets.hostels ?? [];
    const blocks = summary?.facets.blocks ?? [];
    const floors = summary?.facets.floors ?? [];
    return {
      hostels: ['All Hostels', ...hostels] as const,
      blocks: ['All Blocks', ...blocks] as const,
      floors: ['All Floors', ...floors] as const,
    };
  }, [summary?.facets]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return roster.filter((row) => {
      if (hostelFilter !== 'All Hostels' && row.hostel !== hostelFilter) return false;
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
  }, [roster, search, hostelFilter, blockFilter, floorFilter, markFilter]);

  const listKey = `${sessionDate}|${search}|${hostelFilter}|${blockFilter}|${floorFilter}|${markFilter}|${roster.length}`;

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-att-reveal]'), {
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
    setHostelFilter('All Hostels');
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
    const targets = roster.filter(
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
      toast.success(`${block} · ${floor} marked present. Review exceptions before publish.`);
    }
  };

  const publish = () => {
    const unmarked = roster.filter((r) => r.mark === 'Unmarked').length;
    if (unmarked > 0) {
      toast.error(`${unmarked} residents still unmarked.`);
      return;
    }
    toast.success('Roster ready for publish. Session totals are saved to attendance records.');
  };

  return (
    <div ref={rootRef} className="space-y-6 pb-6">
      <AdminAttendancePageHeader
        sessionDate={sessionDate}
        onSessionDateChange={setSessionDate}
        onPublish={publish}
        summary={summary}
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
      <AdminAttendanceStatsStrip summary={summary} loading={loading} />
      <AdminAttendanceFiltersBar
        search={search}
        onSearchChange={setSearch}
        hostelFilter={hostelFilter}
        onHostelFilterChange={setHostelFilter}
        blockFilter={blockFilter}
        onBlockFilterChange={setBlockFilter}
        floorFilter={floorFilter}
        onFloorFilterChange={setFloorFilter}
        markFilter={markFilter}
        onMarkFilterChange={setMarkFilter}
        onReset={reset}
        onBulkFloorPresent={() => void bulkFloorPresent()}
        hostelOptions={facetOptions.hostels}
        blockOptions={facetOptions.blocks}
        floorOptions={facetOptions.floors}
      />
      {loading && roster.length === 0 ? (
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
      <AdminAttendanceSessionsDirectory sessions={sessions} />
    </div>
  );
}
