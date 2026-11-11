'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ClipboardList, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { WardenStudentsDirectory } from '@/components/dashboard/warden/students/warden-students-directory';
import { WardenStudentsFilters } from '@/components/dashboard/warden/students/warden-students-filters';
import { WardenStudentsHeader } from '@/components/dashboard/warden/students/warden-students-header';
import { WardenStudentsQuickLinks } from '@/components/dashboard/warden/students/warden-students-quick-links';
import { WardenStudentsStatsStrip } from '@/components/dashboard/warden/students/warden-students-stats-strip';
import { WardenStudentsVerificationGuide } from '@/components/dashboard/warden/students/warden-students-verification-guide';
import {
  getWardenHostelApiFilter,
  getWardenHostelDisplayName,
} from '@/components/dashboard/warden/students/warden-students-hostel';
import { useWardenShell } from '@/components/dashboard/warden/warden-shell-provider';
import { Button } from '@/components/ui/button';
import { useOperationalDashboardOverview } from '@/hooks/use-operational-dashboard-overview';
import { useStudentDirectory } from '@/hooks/use-student-directory';
import { useWardenHostelStudentStats } from '@/hooks/use-warden-hostel-student-stats';
import { cn } from '@/lib/utils';

type DeskTab = 'residents' | 'verification';

const motionEase = [0.22, 1, 0.36, 1] as const;

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

export function WardenStudentsPage() {
  const reduceMotion = useReducedMotion();
  const { selectedHostelId } = useWardenShell();
  const { overview, refresh: refreshOverview } = useOperationalDashboardOverview('HOSTEL_WARDEN');
  const scopeHostelNames = overview?.scope.hostelNames ?? [];
  const hostelApiFilter = getWardenHostelApiFilter(selectedHostelId, scopeHostelNames);
  const hostelDisplay = getWardenHostelDisplayName(selectedHostelId, scopeHostelNames);

  const [tab, setTab] = useState<DeskTab>('residents');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [courseFilter, setCourseFilter] = useState('All Courses');
  const [yearFilter, setYearFilter] = useState('All Years');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (tab === 'verification') {
      setStatusFilter('Pending');
    }
  }, [tab]);

  const filters = useMemo(
    () => ({
      q: search,
      status: tab === 'verification' ? 'Pending' : statusFilter,
      hostel: hostelApiFilter || 'All Hostels',
      course: courseFilter,
      academicYear: yearFilter,
      page,
      pageSize,
    }),
    [search, statusFilter, hostelApiFilter, courseFilter, yearFilter, page, pageSize, tab],
  );

  const { summary, students, total, loadingList, error, refresh, lastSyncedAt } = useStudentDirectory(filters, {
    pollIntervalMs: 60_000,
  });
  const { stats: hostelStats, loading: loadingHostelStats } = useWardenHostelStudentStats(
    hostelApiFilter || 'All Hostels',
  );

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const facetOptions = useMemo(() => {
    const facets = summary?.facets;
    return {
      courses: ['All Courses', ...(facets?.courses ?? [])] as const,
      years: ['All Years', ...(facets?.academicYears ?? [])] as const,
    };
  }, [summary?.facets]);

  const pendingInView = useMemo(() => students.filter((s) => s.status === 'Pending').length, [students]);

  const switchTab = (next: DeskTab) => {
    setTab(next);
    setPage(1);
    if (next === 'verification') setStatusFilter('Pending');
    else setStatusFilter('All Status');
  };

  return (
    <div className="space-y-6 pb-8">
      <WardenStudentsHeader
        hostelName={hostelDisplay}
        totalResidents={hostelStats?.total ?? total}
        pendingVerification={hostelStats?.pending ?? (tab === 'verification' ? total : pendingInView)}
      />

      <WardenStudentsStatsStrip hostelName={hostelDisplay} stats={hostelStats} loading={loadingHostelStats} />

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Student desk views">
        {(
          [
            { id: 'residents' as const, label: 'Residents', icon: Users, hint: 'Allocations & profiles' },
            { id: 'verification' as const, label: 'Verification queue', icon: ClipboardList, hint: 'Tier-2 admissions' },
          ] as const
        ).map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <Button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              variant={active ? 'default' : 'outline'}
              className={cn(
                'h-10 rounded-xl px-4',
                active && 'bg-[var(--nestora-forest)] text-white hover:bg-[var(--nestora-forest)]/90',
                focusRing,
              )}
              onClick={() => switchTab(item.id)}
            >
              <Icon className="size-4" aria-hidden />
              <span>{item.label}</span>
              <span className="hidden text-xs opacity-80 sm:inline">· {item.hint}</span>
            </Button>
          );
        })}
        {error ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto rounded-lg"
            onClick={() => {
              refreshOverview();
              refresh();
            }}
          >
            Retry
          </Button>
        ) : lastSyncedAt ? (
          <span className="ml-auto text-xs text-muted-foreground tabular-nums">
            Synced{' '}
            {new Date(lastSyncedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
          </span>
        ) : null}
      </div>

      {tab === 'verification' ? <WardenStudentsVerificationGuide /> : null}

      <WardenStudentsFilters
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        statusFilter={tab === 'verification' ? 'Pending' : statusFilter}
        onStatusFilterChange={(v) => {
          setStatusFilter(v);
          setPage(1);
        }}
        courseFilter={courseFilter}
        onCourseFilterChange={(v) => {
          setCourseFilter(v);
          setPage(1);
        }}
        yearFilter={yearFilter}
        onYearFilterChange={(v) => {
          setYearFilter(v);
          setPage(1);
        }}
        lockStatus={tab === 'verification'}
        courseOptions={facetOptions.courses}
        yearOptions={facetOptions.years}
        filteredCount={total}
        onReset={() => {
          setSearch('');
          setCourseFilter('All Courses');
          setYearFilter('All Years');
          setPage(1);
          if (tab === 'residents') setStatusFilter('All Status');
        }}
      />

      <motion.div
        key={tab}
        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: motionEase }}
      >
        <WardenStudentsDirectory
          rows={students}
          loading={loadingList}
          error={error}
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          showVerificationActions={tab === 'verification'}
          emptyHint={
            tab === 'verification'
              ? 'Try clearing search or check back when admin-verified applications arrive.'
              : 'Adjust search or switch to the verification queue for pending admissions.'
          }
        />
      </motion.div>

      <WardenStudentsQuickLinks onOpenVerification={() => switchTab('verification')} />

      <p className="text-[11px] text-muted-foreground" role="note">
        Data is limited to <strong className="font-semibold text-foreground">{hostelDisplay}</strong>. Wardens cannot
        access other hostels or university-wide admin student tools (FR-124 scope).
      </p>
    </div>
  );
}
