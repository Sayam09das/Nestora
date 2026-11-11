'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  BedDouble,
  CalendarOff,
  ClipboardList,
  Loader2,
  MessageSquareWarning,
  UserCheck,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import type { OperationalDashboardSession } from '@/hooks/use-operational-dashboard-overview';
import type { OperationalRole } from '@/hooks/use-operational-dashboard-overview';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const motionEase = [0.22, 1, 0.36, 1] as const;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

type OperationalDashboardHomeProps = {
  role: OperationalRole;
  session: OperationalDashboardSession;
};

export function OperationalDashboardHome({ role, session }: OperationalDashboardHomeProps) {
  const reduceMotion = useReducedMotion();
  const { displayName, overview, loading, error, refresh } = session;
  const [greeting, setGreeting] = useState(() => getGreeting());

  useEffect(() => {
    setGreeting(getGreeting());
    const id = setInterval(() => setGreeting(getGreeting()), 60_000);
    return () => clearInterval(id);
  }, []);

  const roleLabel = role === 'HOSTEL_WARDEN' ? 'Hostel Warden' : 'Hostel Staff';
  const scopeLabel =
    overview?.scope.unassigned || (overview?.scope.hostelNames.length ?? 0) === 0
      ? 'No hostel assigned yet — ask your administrator to link you to a residence.'
      : overview!.scope.hostelNames.join(' · ');

  const statCards = useMemo(
    () => [
      {
        key: 'occupancy',
        label: 'Bed occupancy',
        value:
          overview?.occupancy.totalOperationalBeds === 0
            ? '—'
            : overview?.occupancy.percent != null
              ? `${overview.occupancy.percent}%`
              : '—',
        hint: `${overview?.occupancy.occupiedBeds ?? 0} occupied · ${overview?.occupancy.availableBeds ?? 0} free`,
        icon: BedDouble,
      },
      {
        key: 'residents',
        label: 'Active residents',
        value: overview?.residents.activeAllocations ?? 0,
        hint: 'Students with an active bed',
        icon: Users,
      },
      {
        key: 'attendance',
        label: 'Attendance today',
        value:
          overview?.attendanceToday.percent != null ? `${overview.attendanceToday.percent}%` : '—',
        hint: `${overview?.attendanceToday.present ?? 0} present · ${overview?.attendanceToday.onLeave ?? 0} on leave`,
        icon: UserCheck,
      },
      {
        key: 'approvals',
        label: 'Needs action',
        value: overview?.approvals.totalPending ?? 0,
        hint: `${overview?.approvals.leaveRequests ?? 0} leave · ${overview?.approvals.complaints ?? 0} complaints`,
        icon: CalendarOff,
      },
      ...(role === 'HOSTEL_STAFF'
        ? [
            {
              key: 'tickets',
              label: 'My tickets',
              value: overview?.operations.myAssignedTickets ?? 0,
              hint: `${overview?.operations.dutiesToday ?? 0} duty slot(s) today`,
              icon: ClipboardList,
            },
          ]
        : [
            {
              key: 'admissions',
              label: 'Admission queue',
              value: overview?.approvals.pendingAdmissions ?? 0,
              hint: 'Fully approved, awaiting bed',
              icon: MessageSquareWarning,
            },
          ]),
    ],
    [overview, role],
  );

  return (
    <div className="space-y-8 pb-4">
      <section className="relative overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] bg-card p-6 shadow-sm">
        <p className="text-xs text-muted-foreground">
          {greeting}, <span className="font-medium text-foreground">{displayName}</span>
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-[var(--nestora-forest)]">{roleLabel} dashboard</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{scopeLabel}</p>
        {error ? (
          <p className="mt-3 text-sm text-destructive">
            {error}{' '}
            <Button type="button" variant="link" className="h-auto p-0 text-destructive" onClick={() => refresh()}>
              Retry
            </Button>
          </p>
        ) : null}
      </section>

      <section aria-labelledby="ops-stats-heading">
        <h2 id="ops-stats-heading" className="sr-only">
          Operational statistics
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <li key={card.key}>
                <motion.article
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.35, ease: motionEase }}
                  className={cn(
                    'rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card p-4 shadow-sm',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      {card.label}
                    </p>
                    <span className="flex size-8 items-center justify-center rounded-lg border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] text-[var(--nestora-sage)]">
                      <Icon className="size-4" aria-hidden />
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--nestora-forest)]">
                    {loading ? '—' : typeof card.value === 'number' ? card.value.toLocaleString('en-IN') : card.value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{loading ? '…' : card.hint}</p>
                </motion.article>
              </li>
            );
          })}
        </ul>
      </section>

      {loading ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
          Refreshing live metrics…
        </p>
      ) : (
        <p className="text-xs text-muted-foreground" role="note">
          Counts are scoped to your assigned hostel(s) and refresh every minute.
          {overview?.generatedAt ? (
            <>
              {' '}
              Metrics synced{' '}
              {new Date(overview.generatedAt).toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
              })}
              .
            </>
          ) : null}{' '}
          Workflow pages (tickets, duties, residents) open from the sidebar.
        </p>
      )}
    </div>
  );
}
