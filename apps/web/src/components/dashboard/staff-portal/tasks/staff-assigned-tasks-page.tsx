'use client';

import { useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';

import {
  listStaffAssignedTasks,
  TASK_STATUS_LABELS,
  type StaffDashboardTask,
  type StaffTaskStatus,
} from '@/components/dashboard/staff-portal/home/staff-dashboard-data';
import { StaffDashboardLiveStatus } from '@/components/dashboard/staff-portal/home/staff-dashboard-live-status';
import { useStaffShell } from '@/components/dashboard/staff-portal/staff-shell-provider';
import { Button } from '@/components/ui/button';
import { useStaffDashboardDesk } from '@/hooks/use-staff-dashboard-desk';
import { cn } from '@/lib/utils';

type StatusFilter = 'all' | StaffTaskStatus;

const FILTER_OPTIONS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'pending', label: 'Pending' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'completed', label: 'Completed' },
];

const statusStyles: Record<StaffTaskStatus, string> = {
  completed:
    'border-[color-mix(in_oklch,emerald_55%_30%,var(--border))] bg-[color-mix(in_oklch,emerald_50%_10%,var(--card))] text-emerald-800 dark:text-emerald-200',
  in_progress:
    'border-[color-mix(in_oklch,var(--nestora-gold)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_12%,var(--card))] text-[var(--nestora-forest)]',
  pending: 'border-border bg-muted/40 text-muted-foreground',
  overdue: 'border-[color-mix(in_oklch,#c2410c_35%,var(--border))] bg-[color-mix(in_oklch,#c2410c_10%,var(--card))] text-[#9a3412]',
};

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

function countByStatus(tasks: StaffDashboardTask[]): Record<StaffTaskStatus, number> {
  return tasks.reduce(
    (acc, task) => {
      acc[task.status] += 1;
      return acc;
    },
    { completed: 0, in_progress: 0, pending: 0, overdue: 0 },
  );
}

export function StaffAssignedTasksPage() {
  const { dutyRole, displayName, workplaceName, shift } = useStaffShell();
  const desk = useStaffDashboardDesk({ dutyRole, displayName, workplaceName, shift });
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const tasksFromDesk = useMemo(
    () => listStaffAssignedTasks(desk.overview, desk.tickets, displayName),
    [desk.overview, desk.tickets, displayName],
  );

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return tasksFromDesk;
    return tasksFromDesk.filter((task) => task.status === statusFilter);
  }, [statusFilter, tasksFromDesk]);

  const counts = useMemo(() => countByStatus(tasksFromDesk), [tasksFromDesk]);

  const openCount = counts.in_progress + counts.pending + counts.overdue;

  return (
    <div className="space-y-6 pb-4">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--nestora-forest)] sm:text-2xl">My Assigned Tasks</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live work orders and duty items for {workplaceName !== 'Assigned hostel' ? workplaceName : 'your hostel'}.
            Refreshes every 20 seconds.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn('shrink-0 gap-2', focusRing)}
          disabled={desk.loading}
          onClick={() => desk.refresh()}
        >
          <RefreshCw className={cn('size-4', desk.loading && 'animate-spin')} aria-hidden />
          Refresh
        </Button>
      </header>

      <StaffDashboardLiveStatus
        loading={desk.loading}
        error={desk.error}
        refresh={desk.refresh}
        hasOverview={desk.overview != null}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Task summary">
        <StatCard label="Open" value={openCount} hint="Active assignments" />
        <StatCard label="In progress" value={counts.in_progress} hint="Being worked" />
        <StatCard label="Overdue" value={counts.overdue} hint="Past SLA" accent="warn" />
        <StatCard label="Completed" value={counts.completed} hint="Resolved tickets" accent="ok" />
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by status">
        {FILTER_OPTIONS.map((option) => {
          const active = statusFilter === option.id;
          const badge =
            option.id === 'all' ? tasksFromDesk.length : (counts[option.id as StaffTaskStatus] ?? 0);
          return (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setStatusFilter(option.id)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                focusRing,
                active
                  ? 'border-[var(--nestora-forest)] bg-[var(--nestora-forest)] text-white'
                  : 'border-border bg-card text-muted-foreground hover:border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] hover:text-foreground',
              )}
            >
              {option.label}
              <span className="ml-1.5 tabular-nums opacity-80">({badge})</span>
            </button>
          );
        })}
      </div>

      <section
        className="overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_20%,var(--border))] bg-card shadow-sm"
        aria-labelledby="staff-tasks-list-heading"
      >
        <h2 id="staff-tasks-list-heading" className="sr-only">
          Task list
        </h2>
        {desk.loading && !desk.overview ? (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">Loading assignments…</p>
        ) : filtered.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">
            {statusFilter === 'all'
              ? 'No work orders assigned to you right now.'
              : `No tasks in “${FILTER_OPTIONS.find((o) => o.id === statusFilter)?.label}”.`}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((task) => (
              <li
                key={task.id}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {task.category} · {task.area}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-xs font-medium tabular-nums text-muted-foreground">{task.time}</span>
                  <span
                    className={cn(
                      'inline-flex min-w-[5.5rem] justify-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                      statusStyles[task.status],
                    )}
                  >
                    {TASK_STATUS_LABELS[task.status]}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {tasksFromDesk.length} assignments
        {desk.overview?.generatedAt
          ? ` · Last sync ${new Date(desk.overview.generatedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}`
          : ''}
        .
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: number;
  hint: string;
  accent?: 'warn' | 'ok';
}) {
  return (
    <div className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card p-4 shadow-sm">
      <p
        className={cn(
          'text-2xl font-semibold tabular-nums tracking-tight',
          accent === 'warn' && value > 0
            ? 'text-[#c2410c]'
            : accent === 'ok'
              ? 'text-emerald-700'
              : 'text-[var(--nestora-forest)]',
        )}
      >
        {String(value).padStart(2, '0')}
      </p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}