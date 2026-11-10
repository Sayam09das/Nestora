'use client';

import { useReducedMotion } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { AdminAttendanceFiltersBar } from '@/components/dashboard/attendance/admin-attendance-filters-bar';
import { AdminAttendancePageHeader } from '@/components/dashboard/attendance/admin-attendance-page-header';
import { AdminAttendanceRoster } from '@/components/dashboard/attendance/admin-attendance-roster';
import { AdminAttendanceSessionsDirectory } from '@/components/dashboard/attendance/admin-attendance-sessions-directory';
import { AdminAttendanceStatsStrip } from '@/components/dashboard/attendance/admin-attendance-stats-strip';
import {
  SAMPLE_ROSTER,
  SAMPLE_SESSIONS,
  type AttendanceMark,
  type AttendanceRosterRow,
} from '@/components/dashboard/attendance/admin-attendance-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';

export function AdminAttendancePage() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);

  const [sessionDate, setSessionDate] = useState('2026-03-10');
  const [roster, setRoster] = useState<AttendanceRosterRow[]>(SAMPLE_ROSTER);
  const [search, setSearch] = useState('');
  const [hostelFilter, setHostelFilter] = useState('All Hostels');
  const [blockFilter, setBlockFilter] = useState('All Blocks');
  const [floorFilter, setFloorFilter] = useState('All Floors');
  const [markFilter, setMarkFilter] = useState('All Marks');

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

  const listKey = `${search}|${hostelFilter}|${blockFilter}|${floorFilter}|${markFilter}`;

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

  const onMarkChange = (id: string, mark: AttendanceMark) => {
    setRoster((prev) => prev.map((r) => (r.id === id ? { ...r, mark } : r)));
  };

  const bulkFloorPresent = () => {
    const floor = floorFilter !== 'All Floors' ? floorFilter : null;
    const block = blockFilter !== 'All Blocks' ? blockFilter : null;
    if (!floor || !block) {
      toast.message('Select a specific block and floor to bulk-mark present.');
      return;
    }
    setRoster((prev) =>
      prev.map((r) => (r.block === block && r.floor === floor && !r.onApprovedLeave ? { ...r, mark: 'Present' as const } : r)),
    );
    toast.success(`${block} · ${floor} marked present (sample). Toggle exceptions before publish.`);
  };

  const publish = () => {
    const unmarked = roster.filter((r) => r.mark === 'Unmarked').length;
    if (unmarked > 0) {
      toast.error(`${unmarked} residents still unmarked.`);
      return;
    }
    toast.success('Roster published (sample UI). Revisions will append to audit log.');
  };

  return (
    <div ref={rootRef} className="space-y-6 pb-6">
      <AdminAttendancePageHeader sessionDate={sessionDate} onSessionDateChange={setSessionDate} onPublish={publish} />
      <AdminAttendanceStatsStrip />
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
        onBulkFloorPresent={bulkFloorPresent}
      />
      <AdminAttendanceRoster rows={filtered} onMarkChange={onMarkChange} listKey={listKey} />
      <AdminAttendanceSessionsDirectory sessions={SAMPLE_SESSIONS} />
    </div>
  );
}
