'use client';

import { useMemo } from 'react';
import { CalendarDays, MapPin, RefreshCw } from 'lucide-react';

import { StaffDashboardLiveStatus } from '@/components/dashboard/staff-portal/home/staff-dashboard-live-status';
import { useStaffShell } from '@/components/dashboard/staff-portal/staff-shell-provider';
import { Button } from '@/components/ui/button';
import { useStaffSchedule } from '@/hooks/use-staff-schedule';
import type { StaffScheduleEntry } from '@/lib/api/dashboard';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

function formatDutyDate(isoDate: string, style: 'long' | 'weekday' = 'long'): string {
  const parts = isoDate.split('-').map(Number);
  const y = parts[0] ?? 1970;
  const m = parts[1] ?? 1;
  const d = parts[2] ?? 1;
  const date = new Date(Date.UTC(y, m - 1, d));
  if (style === 'weekday') {
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
  return date.toLocaleDateString(undefined, { dateStyle: 'full' });
}

function todayIsoLocal(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())).toISOString().slice(0, 10);
}

function groupByDate(entries: StaffScheduleEntry[]): Map<string, StaffScheduleEntry[]> {
  const map = new Map<string, StaffScheduleEntry[]>();
  for (const entry of entries) {
    const list = map.get(entry.dutyDate) ?? [];
    list.push(entry);
    map.set(entry.dutyDate, list);
  }
  return map;
}

export function StaffSchedulePage() {
  const { workplaceName, shift } = useStaffShell();
  const { schedule, loading, error, refresh } = useStaffSchedule();

  const todayKey = todayIsoLocal();
  const todayEntries = useMemo(
    () => schedule?.entries.filter((e) => e.dutyDate === todayKey) ?? [],
    [schedule?.entries, todayKey],
  );

  const grouped = useMemo(() => {
    if (!schedule?.entries.length) return [];
    const byDate = groupByDate(schedule.entries);
    return [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [schedule?.entries]);

  const upcomingCount = useMemo(() => {
    if (!schedule) return 0;
    return schedule.entries.filter((e) => e.dutyDate >= todayKey).length;
  }, [schedule, todayKey]);

  const primaryToday = todayEntries[0];

  return (
    <div className="space-y-6 pb-4">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--nestora-forest)] sm:text-2xl">My Schedule</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Duty roster from your hostel assignments
            {schedule ? ` · ${formatDutyDate(schedule.from)} through ${formatDutyDate(schedule.to)}` : ''}.
            Refreshes every 20 seconds.
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

      <StaffDashboardLiveStatus
        loading={loading}
        error={error}
        refresh={refresh}
        hasOverview={schedule != null}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <TodayShiftCard
          onDuty={todayEntries.length > 0 || shift.state === 'on_duty'}
          primary={primaryToday}
          fallbackWindow={shift.timeWindow}
          fallbackLabel={shift.label}
          workplace={workplaceName}
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-2">
          <MiniStat label="Today" value={todayEntries.length} hint="Duty slots today" />
          <MiniStat label="Upcoming" value={upcomingCount} hint="From today in range" />
        </div>
      </div>

      <section
        className="overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_20%,var(--border))] bg-card shadow-sm"
        aria-labelledby="staff-schedule-list-heading"
      >
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <CalendarDays className="size-4 text-[var(--nestora-sage)]" aria-hidden />
          <h2 id="staff-schedule-list-heading" className="text-sm font-semibold text-[var(--nestora-forest)]">
            Duty calendar
          </h2>
        </div>

        {loading && !schedule ? (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">Loading schedule…</p>
        ) : grouped.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">
            No duty assignments in this range. Your warden can add roster rows when shifts are published.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {grouped.map(([date, items]) => {
              const isToday = date === todayKey;
              return (
                <li key={date} className={cn(isToday && 'bg-[color-mix(in_oklch,var(--nestora-cream)_18%,var(--card))]')}>
                  <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                    <p className="text-sm font-semibold text-foreground">{formatDutyDate(date, 'weekday')}</p>
                    {isToday ? (
                      <span className="rounded-full bg-[var(--nestora-forest)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        Today
                      </span>
                    ) : null}
                  </div>
                  <ul className="divide-y divide-border border-t border-border">
                    {items.map((entry) => (
                      <ScheduleRow key={entry.id} entry={entry} highlight={isToday} />
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {schedule?.generatedAt ? (
        <p className="text-xs text-muted-foreground">
          Last sync{' '}
          {new Date(schedule.generatedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}.
        </p>
      ) : null}
    </div>
  );
}

function TodayShiftCard({
  onDuty,
  primary,
  fallbackWindow,
  fallbackLabel,
  workplace,
}: {
  onDuty: boolean;
  primary?: StaffScheduleEntry;
  fallbackWindow: string;
  fallbackLabel: string;
  workplace: string;
}) {
  const window = primary?.timeWindow ?? fallbackWindow;
  const label = onDuty ? (primary ? primary.shiftLabel : fallbackLabel) : 'Off duty';
  const location = primary?.zone ?? (workplace !== 'Assigned hostel' ? workplace : primary?.hostelName ?? '—');

  return (
    <article className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card p-5 shadow-sm lg:col-span-1">
      <header className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-[var(--nestora-forest)]">Today&apos;s shift</h2>
          <p className="text-sm text-muted-foreground">{primary?.hostelName ?? workplace}</p>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
            onDuty
              ? 'border-[color-mix(in_oklch,emerald_55%_28%,var(--border))] bg-[color-mix(in_oklch,emerald_50%_10%,var(--card))] text-[var(--nestora-forest)]'
              : 'border-border bg-muted/50 text-muted-foreground',
          )}
        >
          <span className={cn('size-1.5 rounded-full', onDuty ? 'bg-emerald-500' : 'bg-muted-foreground')} aria-hidden />
          {label}
        </span>
      </header>
      <p className="mt-4 text-2xl font-semibold tabular-nums tracking-tight text-[var(--nestora-forest)]">{window}</p>
      <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
        <MapPin className="mt-0.5 size-4 shrink-0 text-[var(--nestora-gold)]" aria-hidden />
        <span>
          <span className="font-medium text-foreground">Zone:</span> {location}
        </span>
      </p>
    </article>
  );
}

function ScheduleRow({ entry, highlight }: { entry: StaffScheduleEntry; highlight: boolean }) {
  return (
    <li className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-medium text-foreground">{entry.shiftLabel}</p>
        <p className="text-xs text-muted-foreground">
          {entry.hostelName}
          {entry.zone ? ` · ${entry.zone}` : ''}
        </p>
      </div>
      <span
        className={cn(
          'shrink-0 text-sm font-semibold tabular-nums',
          highlight ? 'text-[var(--nestora-forest)]' : 'text-muted-foreground',
        )}
      >
        {entry.timeWindow}
      </span>
    </li>
  );
}

function MiniStat({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card p-4 shadow-sm">
      <p className="text-2xl font-semibold tabular-nums tracking-tight text-[var(--nestora-forest)]">
        {String(value).padStart(2, '0')}
      </p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}