'use client';

import { Bell, Building2, RefreshCw, Settings2, Shield, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { StaffDashboardLiveStatus } from '@/components/dashboard/staff-portal/home/staff-dashboard-live-status';
import {
  STAFF_ROLE_LABELS,
  type StaffDutyRole,
} from '@/components/dashboard/staff-portal/staff-nav-permissions';
import { STAFF_DUTY_ROLE_STORAGE_KEY } from '@/components/dashboard/staff-portal/staff-topbar-data';
import { useStaffShell } from '@/components/dashboard/staff-portal/staff-shell-provider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useStaffSettingsDesk } from '@/hooks/use-staff-settings-desk';
import { revokeStaffOtherSessions } from '@/lib/api/dashboard';
import { formatRelativeTimeFromIso } from '@/lib/format-relative-time';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

const SIDEBAR_STORAGE_KEY = 'nestora-staff-sidebar-collapsed';

const NOTIFICATION_ROWS: Array<{
  key: keyof import('@/lib/api/dashboard').StaffSettingsDesk['notifications'];
  label: string;
  description: string;
}> = [
  { key: 'emailNotices', label: 'Hostel notices', description: 'Announcements and operational broadcasts.' },
  { key: 'emailMaintenance', label: 'Maintenance & tasks', description: 'Ticket assignments and work-order updates.' },
  { key: 'emailLeaves', label: 'Leave & attendance', description: 'Shift changes and attendance-related alerts.' },
  { key: 'emailFees', label: 'Fee reminders', description: 'Student fee notices when relevant to your role.' },
];

const DUTY_ROLES = Object.keys(STAFF_ROLE_LABELS) as StaffDutyRole[];

export function StaffSettingsPage() {
  const { workplaceName, setSidebarCollapsed } = useStaffShell();
  const { desk, sessions, loading, error, refresh, updateNotification } = useStaffSettingsDesk();
  const [revoking, setRevoking] = useState(false);
  const [sidebarCompact, setSidebarCompact] = useState(false);
  const [dutyRole, setDutyRole] = useState<StaffDutyRole>('security_guard');

  useEffect(() => {
    try {
      setSidebarCompact(localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1');
      const stored = localStorage.getItem(STAFF_DUTY_ROLE_STORAGE_KEY);
      if (stored && stored in STAFF_ROLE_LABELS) setDutyRole(stored as StaffDutyRole);
    } catch {
      // ignore
    }
  }, []);

  const liveLabel = desk?.generatedAt ? formatRelativeTimeFromIso(desk.generatedAt) : null;
  const hostelLabel =
    desk?.scope.hostelNames.join(' · ') ||
    (workplaceName !== 'Assigned hostel' ? workplaceName : 'No hostel assigned');

  async function onRevokeOthers() {
    setRevoking(true);
    const result = await revokeStaffOtherSessions();
    setRevoking(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success('Signed out all other devices.');
    refresh();
  }

  function onSidebarCompactChange(next: boolean) {
    setSidebarCompact(next);
    setSidebarCollapsed(next);
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? '1' : '0');
    } catch {
      // ignore
    }
  }

  function onDutyRoleChange(role: StaffDutyRole) {
    setDutyRole(role);
    try {
      localStorage.setItem(STAFF_DUTY_ROLE_STORAGE_KEY, role);
    } catch {
      // ignore
    }
    toast.message('Duty view updated on this device. Reload the page for full nav changes.');
  }

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--nestora-forest)] sm:text-2xl">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Notifications, security, and workspace preferences for {hostelLabel}. Updates every 20 seconds.
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

      {desk ? (
        <SettingsHeaderStrip generatedAt={liveLabel} operations={desk.operations} hostelLabel={hostelLabel} />
      ) : null}

      <section className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Bell className="size-4 text-[var(--nestora-sage)]" aria-hidden />
          <h2 className="text-base font-semibold text-[var(--nestora-forest)]">Email notifications</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Saved to your Nestora account and synced across devices.</p>
        <ul className="mt-4 divide-y rounded-xl border">
          {NOTIFICATION_ROWS.map((row) => (
            <li key={row.key} className="flex items-start justify-between gap-4 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-[var(--nestora-forest)]">{row.label}</p>
                <p className="text-xs text-muted-foreground">{row.description}</p>
              </div>
              <Switch
                checked={desk?.notifications[row.key] ?? true}
                onCheckedChange={(checked) => void updateNotification(row.key, checked)}
                disabled={!desk || loading}
                aria-label={row.label}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Smartphone className="size-4 text-[var(--nestora-sage)]" aria-hidden />
          <h2 className="text-base font-semibold text-[var(--nestora-forest)]">Workspace</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Device-local layout hints (not stored on the server).</p>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-xl border px-4 py-3">
            <div>
              <p className="text-sm font-medium text-[var(--nestora-forest)]">Compact sidebar</p>
              <p className="text-xs text-muted-foreground">Start with the navigation rail collapsed.</p>
            </div>
            <Switch
              checked={sidebarCompact}
              onCheckedChange={onSidebarCompactChange}
              aria-label="Compact sidebar"
            />
          </div>
          <label className="block rounded-xl border px-4 py-3">
            <span className="text-sm font-medium text-[var(--nestora-forest)]">Duty role view</span>
            <p className="text-xs text-muted-foreground">Adjusts quick labels and search hints on this browser.</p>
            <select
              className={cn('mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm', focusRing)}
              value={dutyRole}
              onChange={(e) => onDutyRoleChange(e.target.value as StaffDutyRole)}
            >
              {DUTY_ROLES.map((role) => (
                <option key={role} value={role}>
                  {STAFF_ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Shield className="size-4 text-[var(--nestora-sage)]" aria-hidden />
            <h2 className="text-base font-semibold text-[var(--nestora-forest)]">Security</h2>
          </div>
          <SecurityActions mustChangePassword={desk?.security.mustChangePassword} />
        </div>
        {desk ? (
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <SecurityRow label="Signed in as" value={desk.security.email} />
            <SecurityRow label="MFA" value={desk.security.mfaEnabled ? 'Enabled' : 'Not enabled'} />
            <SecurityRow
              label="Account"
              value={desk.security.isVerified ? 'Verified' : 'Pending verification'}
            />
          </dl>
        ) : null}
        <ul className="mt-4 space-y-2">
          {sessions.map((session) => (
            <li
              key={session.id}
              className={cn(
                'rounded-xl border px-3 py-2.5 text-xs',
                session.isCurrent &&
                  'border-[var(--nestora-forest)] bg-[color-mix(in_oklch,var(--nestora-sage-light)_40%,var(--card))]',
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-[var(--nestora-forest)]">
                  {session.isCurrent ? 'This device' : 'Active session'}
                </span>
                <span className="text-muted-foreground">
                  Last active{' '}
                  {session.lastActivityAt ? formatRelativeTimeFromIso(session.lastActivityAt) : '—'}
                </span>
              </div>
              <p className="mt-1 truncate text-muted-foreground">{session.userAgent ?? 'Unknown browser'}</p>
              {session.ipAddress ? (
                <p className="mt-0.5 text-[10px] text-muted-foreground">IP {session.ipAddress}</p>
              ) : null}
            </li>
          ))}
          {!sessions.length && !loading ? (
            <li className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
              No active sessions reported.
            </li>
          ) : null}
        </ul>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn('mt-4', focusRing)}
          disabled={revoking || sessions.length <= 1}
          onClick={() => void onRevokeOthers()}
        >
          {revoking ? 'Signing out…' : 'Sign out other devices'}
        </Button>
      </section>
    </div>
  );
}

function SettingsHeaderStrip({
  generatedAt,
  operations,
  hostelLabel,
}: {
  generatedAt: string | null;
  operations: import('@/lib/api/dashboard').StaffSettingsDesk['operations'];
  hostelLabel: string;
}) {
  return (
    <section className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] bg-[linear-gradient(135deg,color-mix(in_oklch,var(--nestora-cream)_48%,var(--card))_0%,var(--card)_62%)] p-5 shadow-sm">
      <p className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--nestora-sage)]">
        <Settings2 className="size-3.5" aria-hidden />
        Staff preferences
        {generatedAt ? (
          <span className="rounded-full border px-2 py-0.5 text-[10px] font-semibold normal-case tracking-normal text-[var(--nestora-forest)]">
            Synced {generatedAt}
          </span>
        ) : null}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Building2 className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
        {hostelLabel}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border bg-card/80 px-4 py-3">
          <p className="text-xs text-muted-foreground">Duties today</p>
          <p className="text-xl font-semibold tabular-nums text-[var(--nestora-forest)]">{operations.dutiesToday}</p>
        </div>
        <div className="rounded-xl border bg-card/80 px-4 py-3">
          <p className="text-xs text-muted-foreground">My open tasks</p>
          <p className="text-xl font-semibold tabular-nums text-[var(--nestora-forest)]">
            {operations.myAssignedTickets}
          </p>
        </div>
        <div className="rounded-xl border bg-card/80 px-4 py-3">
          <p className="text-xs text-muted-foreground">Open complaints</p>
          <p className="text-xl font-semibold tabular-nums text-[var(--nestora-forest)]">{operations.openComplaints}</p>
        </div>
      </div>
    </section>
  );
}

function SecurityActions({ mustChangePassword }: { mustChangePassword?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        nativeButton={false}
        size="sm"
        variant="outline"
        className={cn('rounded-lg', focusRing)}
        render={<Link href="/staff/profile">My profile</Link>}
      />
      <Button
        nativeButton={false}
        size="sm"
        variant="outline"
        className={cn('rounded-lg', focusRing)}
        render={<Link href="/change-password">{mustChangePassword ? 'Change password (required)' : 'Change password'}</Link>}
      />
    </div>
  );
}

function SecurityRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border px-3 py-2">
      <dt className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-[var(--nestora-forest)]">{value}</dd>
    </div>
  );
}