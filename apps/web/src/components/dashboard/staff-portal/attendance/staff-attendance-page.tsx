'use client';

import { CalendarCheck, Loader2, LogIn, LogOut, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { StaffDashboardLiveStatus } from '@/components/dashboard/staff-portal/home/staff-dashboard-live-status';
import { useStaffShell } from '@/components/dashboard/staff-portal/staff-shell-provider';
import { Button } from '@/components/ui/button';
import { useStaffAttendanceDesk } from '@/hooks/use-staff-attendance-desk';
import { postStaffShiftCheckIn, type StaffAttendanceRecord } from '@/lib/api/dashboard';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

const STATUS_LABEL: Record<StaffAttendanceRecord['status'], string> = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  ON_LEAVE: 'On leave',
};

const STATUS_CLASS: Record<StaffAttendanceRecord['status'], string> = {
  PRESENT:
    'border-[color-mix(in_oklch,emerald_55%_30%,var(--border))] bg-[color-mix(in_oklch,emerald_50%_10%,var(--card))] text-emerald-800 dark:text-emerald-200',
  ABSENT: 'border-[color-mix(in_oklch,#c2410c_35%,var(--border))] bg-[color-mix(in_oklch,#c2410c_10%,var(--card))] text-[#9a3412]',
  ON_LEAVE:
    'border-[color-mix(in_oklch,var(--nestora-gold)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_12%,var(--card))] text-[var(--nestora-forest)]',
};

function formatIsoDate(isoDate: string): string {
  const parts = isoDate.split('-').map(Number);
  const y = parts[0] ?? 1970;
  const m = parts[1] ?? 1;
  const d = parts[2] ?? 1;
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function todayStatusLabel(status: StaffAttendanceRecord['status'] | null, dutyScheduled: boolean): string {
  if (status === 'PRESENT') return 'Marked present';
  if (status === 'ABSENT') return 'Marked absent';
  if (status === 'ON_LEAVE') return 'On approved leave';
  if (dutyScheduled) return 'Duty scheduled — not marked yet';
  return 'No duty scheduled today';
}

export function StaffAttendancePage() {
  const { workplaceName, shift } = useStaffShell();
  const { desk, loading, error, refresh, setDesk } = useStaffAttendanceDesk();
  const [checkingIn, setCheckingIn] = useState(false);

  const summary = desk?.summary;
  const today = desk?.today;
  const students = desk?.hostelStudentsToday;

  const checkInHint = today?.shiftWindow?.split('–')[0]?.trim() ?? shift.timeWindow.split('–')[0]?.trim() ?? '—';
  const checkOutHint = today?.dutyScheduled
    ? (today.shiftWindow?.split('–')[1]?.trim() ?? 'Shift end')
    : 'Not scheduled';

  const canCheckIn = Boolean(today?.dutyScheduled && today?.status !== 'PRESENT');

  const onCheckIn = async () => {
    setCheckingIn(true);
    const result = await postStaffShiftCheckIn();
    setCheckingIn(false);
    if (result.desk) {
      setDesk(result.desk);
      toast.success('Shift check-in recorded.');
    } else {
      toast.error(result.error ?? 'Check-in failed.');
    }
  };

  return (
    <div className="space-y-6 pb-4">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--nestora-forest)] sm:text-2xl">Attendance &amp; Shifts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your duty attendance this month and today&apos;s shift window for{' '}
            {workplaceName !== 'Assigned hostel' ? workplaceName : 'your assigned hostel'}. Refreshes every 20 seconds.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn('shrink-0 gap-2', focusRing)}
          disabled={loading}
          onClick={() => refresh()}
        >
          <RefreshCw className={cn('size-4', loading && 'animate-spin')} aria-hidden />
          Refresh
        </Button>
      </header>

      <StaffDashboardLiveStatus loading={loading} error={error} refresh={refresh} hasOverview={desk != null} />

      <div className="grid gap-4 lg:grid-cols-12">
        <section className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card p-5 shadow-sm lg:col-span-5">
          <h2 className="text-base font-semibold text-[var(--nestora-forest)]">Today&apos;s shift</h2>
          <p className="text-sm text-muted-foreground">
            {todayStatusLabel(today?.status ?? null, Boolean(today?.dutyScheduled))}
          </p>
          <p className="mt-3 text-2xl font-semibold tabular-nums text-[var(--nestora-forest)]">
            {today?.shiftWindow ?? shift.timeWindow}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {today?.shiftLabel ?? 'Shift'} · {today?.hostelName ?? workplaceName}
            {today?.zone ? ` · ${today.zone}` : ''}
          </p>
          {canCheckIn ? (
            <Button
              type="button"
              className={cn('mt-4 w-full gap-2', focusRing)}
              disabled={checkingIn}
              onClick={() => void onCheckIn()}
            >
              {checkingIn ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <LogIn className="size-4" aria-hidden />}
              Check in for today&apos;s shift
            </Button>
          ) : null}
          <div className="mt-4 space-y-2 rounded-xl border border-dashed border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-cream)_20%,var(--card))] p-3">
            <p className="flex items-center gap-2 text-sm">
              <LogIn className="size-4 text-[var(--nestora-sage)]" aria-hidden />
              <span className="text-muted-foreground">Expected check-in</span>
              <span className="ml-auto font-semibold text-foreground">{checkInHint}</span>
            </p>
            <p className="flex items-center gap-2 text-sm">
              <LogOut className="size-4 text-muted-foreground" aria-hidden />
              <span className="text-muted-foreground">Expected check-out</span>
              <span className="ml-auto font-medium text-muted-foreground">{checkOutHint}</span>
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card p-5 shadow-sm lg:col-span-7">
          <h2 className="text-base font-semibold text-[var(--nestora-forest)]">My attendance (this month)</h2>
          <div className="mt-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-2xl font-bold tabular-nums text-[var(--nestora-forest)]">
                {summary ? `${summary.present} / ${summary.total}` : '—'}
              </p>
              <p className="text-xs text-muted-foreground">Present days marked</p>
            </div>
            <span className="rounded-full bg-[color-mix(in_oklch,var(--nestora-sage)_15%,var(--muted))] px-2.5 py-1 text-sm font-bold text-[var(--nestora-forest)]">
              {summary?.percent != null ? `${summary.percent}%` : '—'}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: 'Present', value: summary?.present ?? 0, accent: 'var(--nestora-forest)' },
              { label: 'Absent', value: summary?.absent ?? 0, accent: '#c2410c' },
              { label: 'Leave', value: summary?.onLeave ?? 0, accent: 'var(--nestora-gold)' },
            ].map((item) => (
              <LocalStat key={item.label} label={item.label} value={item.value} accent={item.accent} />
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <section
          className="overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_20%,var(--border))] bg-card shadow-sm lg:col-span-7"
          aria-labelledby="staff-attendance-records-heading"
        >
          <div className="border-b border-border px-4 py-3">
            <h2 id="staff-attendance-records-heading" className="text-sm font-semibold text-[var(--nestora-forest)]">
              Attendance records
            </h2>
          </div>
          {loading && !desk ? (
            <p className="px-4 py-12 text-center text-sm text-muted-foreground">Loading attendance…</p>
          ) : !desk?.records.length ? (
            <p className="px-4 py-12 text-center text-sm text-muted-foreground">
              No attendance marks for this period yet. Wardens record duty attendance when shifts are completed.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {desk.records.map((row) => (
                <li key={row.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-foreground">{formatIsoDate(row.workDate)}</p>
                    <p className="text-xs text-muted-foreground">{row.hostelName}</p>
                  </div>
                  <span
                    className={cn(
                      'inline-flex min-w-[5.5rem] justify-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                      STATUS_CLASS[row.status],
                    )}
                  >
                    {STATUS_LABEL[row.status]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card p-5 shadow-sm lg:col-span-5">
          <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--nestora-forest)]">
            <CalendarCheck className="size-4 text-[var(--nestora-sage)]" aria-hidden />
            Hostel students (today)
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">Resident attendance your team supports during duty.</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <LocalStat label="Present" value={students?.present ?? 0} accent="var(--nestora-forest)" />
            <LocalStat label="Absent" value={students?.absent ?? 0} accent="#c2410c" />
            <LocalStat label="Leave" value={students?.onLeave ?? 0} accent="var(--nestora-gold)" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Mark rate: {students?.percent != null ? `${students.percent}%` : 'No roster submitted today'}
          </p>
        </section>
      </div>

      {desk?.generatedAt ? (
        <p className="text-xs text-muted-foreground">
          Last sync {new Date(desk.generatedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}.
        </p>
      ) : null}
    </div>
  );
}

function LocalStat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/25 p-3 text-center">
      <p className="text-lg font-bold tabular-nums" style={{ color: accent }}>
        {String(value).padStart(2, '0')}
      </p>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}