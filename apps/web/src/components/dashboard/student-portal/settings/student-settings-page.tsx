'use client';

import { Bell, CreditCard, LayoutTemplate, Loader2, RefreshCw, Settings2, Shield, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import { useStudentShell } from '@/components/dashboard/student-portal/student-shell-provider';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { useStudentSettingsDesk } from '@/hooks/use-student-settings-desk';
import type { StudentSettingsDesk } from '@/lib/api/student-settings';
import { revokeStudentOtherSessions } from '@/lib/api/student-settings';
import { formatRelativeTimeFromIso } from '@/lib/format-relative-time';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

const NOTIFICATION_ROWS: Array<{
  key: keyof StudentSettingsDesk['notifications'];
  label: string;
  description: string;
}> = [
  { key: 'emailNotices', label: 'Announcements & events', description: 'Circulars, emergency notices, and activities.' },
  { key: 'emailFees', label: 'Fee reminders', description: 'Payment due dates and fee adjustments.' },
  { key: 'emailLeaves', label: 'Leave decisions', description: 'Approvals and rejections on leave applications.' },
  { key: 'emailMaintenance', label: 'Complaints & maintenance', description: 'Ticket status updates from the hostel office.' },
];

function formatSyncTime(iso: string | undefined): string {
  if (!iso) return 'Syncing…';
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(iso));
}

export function StudentSettingsPage() {
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    feesOnlineEnabled,
    setFeesOnlineEnabled,
    hostelName,
    roomLabel,
  } = useStudentShell();

  const { desk, sessions, loading, error, isRefreshing, refresh, updateNotification } = useStudentSettingsDesk();
  const [revoking, setRevoking] = useState(false);

  const syncLabel = formatSyncTime(desk?.generatedAt);
  const liveLabel = desk?.generatedAt ? formatRelativeTimeFromIso(desk.generatedAt) : null;

  async function onRevokeOthers() {
    setRevoking(true);
    const result = await revokeStudentOtherSessions();
    setRevoking(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success('Signed out all other devices.');
    refresh();
  }

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings2 className="size-5 text-[var(--nestora-forest)]" aria-hidden />
            <h1 className="text-2xl font-bold tracking-tight text-[var(--nestora-forest)]">Settings</h1>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Notifications, security, and display options for {hostelName}. Syncs every 20 seconds.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] bg-card px-3 py-1 text-xs font-medium text-[var(--nestora-forest)]">
              Live · {syncLabel}
              {isRefreshing ? ' · refreshing' : ''}
            </span>
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => refresh()} disabled={loading}>
              {loading || isRefreshing ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
              Refresh
            </Button>
            <Link href="/student" className={cn('text-sm font-semibold text-[var(--nestora-forest)] hover:underline', focusRing)}>
              Back to dashboard
            </Link>
          </div>
        </div>
      </header>

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
          {error}
        </div>
      ) : null}

      {loading && !desk ? (
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      ) : null}

      {desk ? (
        <>
          <section className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <LayoutTemplate className="size-4 text-[var(--nestora-sage)]" aria-hidden />
                <h2 className="text-base font-semibold text-[var(--nestora-forest)]">Account summary</h2>
              </div>
              {liveLabel ? <span className="text-xs text-muted-foreground">Updated {liveLabel}</span> : null}
            </div>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <DtDd label="Email" value={desk.security.email} />
              <DtDd label="Phone" value={desk.security.phone ?? '—'} />
              <DtDd label="Residence" value={desk.residence.hostelName ?? hostelName} />
              <DtDd
                label="Room"
                value={
                  desk.residence.roomNumber && desk.residence.bedNumber
                    ? `Room ${desk.residence.roomNumber} · Bed ${desk.residence.bedNumber}`
                    : roomLabel
                }
              />
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">
              Profile photo, guardian, and academic details —{' '}
              <Link href="/student/profile" className="font-semibold text-[var(--nestora-forest)] hover:underline">
                edit in My Profile
              </Link>
              .
            </p>
          </section>

          <section className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Bell className="size-4 text-[var(--nestora-sage)]" aria-hidden />
              <h2 className="text-base font-semibold text-[var(--nestora-forest)]">Email notifications</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Stored on your Nestora account and synced across devices.</p>
            <ul className="mt-4 divide-y rounded-xl border">
              {NOTIFICATION_ROWS.map((row) => (
                <li key={row.key} className="flex items-start justify-between gap-4 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--nestora-forest)]">{row.label}</p>
                    <p className="text-xs text-muted-foreground">{row.description}</p>
                  </div>
                  <Switch
                    checked={desk.notifications[row.key]}
                    onCheckedChange={(checked) => void updateNotification(row.key, checked)}
                    disabled={loading}
                    aria-label={row.label}
                  />
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Smartphone className="size-4 text-[var(--nestora-sage)]" aria-hidden />
              <h2 className="text-base font-semibold text-[var(--nestora-forest)]">Display</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Device-local preferences (saved in this browser).</p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between gap-4 rounded-xl border px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-[var(--nestora-forest)]">Compact sidebar</p>
                  <p className="text-xs text-muted-foreground">Collapse the navigation rail by default.</p>
                </div>
                <Switch
                  checked={sidebarCollapsed}
                  onCheckedChange={(checked) => setSidebarCollapsed(checked)}
                  aria-label="Compact sidebar"
                />
              </div>
              <div className="flex items-center justify-between gap-4 rounded-xl border px-4 py-3">
                <div className="flex items-start gap-2">
                  <CreditCard className="mt-0.5 size-4 text-[var(--nestora-gold)]" aria-hidden />
                  <div>
                    <p className="text-sm font-medium text-[var(--nestora-forest)]">Fee &amp; payments module</p>
                    <p className="text-xs text-muted-foreground">Show fees in the menu when your hostel uses online billing.</p>
                  </div>
                </div>
                <Switch
                  checked={feesOnlineEnabled}
                  onCheckedChange={setFeesOnlineEnabled}
                  aria-label="Show fees module"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Shield className="size-4 text-[var(--nestora-sage)]" aria-hidden />
                <h2 className="text-base font-semibold text-[var(--nestora-forest)]">Security</h2>
              </div>
              <Link href="/student/help" className={cn('text-xs font-semibold text-[var(--nestora-sage)] hover:underline', focusRing)}>
                Account help
              </Link>
            </div>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <DtDd label="MFA" value={desk.security.mfaEnabled ? 'Enabled' : 'Not enabled'} />
              <DtDd label="Verification" value={desk.security.isVerified ? 'Verified' : 'Pending'} />
              <DtDd label="Active sessions" value={String(desk.activity.activeSessions)} />
              <DtDd
                label="Password"
                value={desk.security.mustChangePassword ? 'Change required' : 'Up to date'}
              />
            </dl>
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
                      Last active {session.lastActivityAt ? formatRelativeTimeFromIso(session.lastActivityAt) : '—'}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-muted-foreground">{session.userAgent ?? 'Unknown browser'}</p>
                </li>
              ))}
            </ul>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn('mt-4', focusRing)}
              disabled={revoking || sessions.length <= 1}
              onClick={() => void onRevokeOthers()}
            >
              {revoking ? <Loader2 className="size-3.5 animate-spin" /> : 'Sign out other devices'}
            </Button>
          </section>
        </>
      ) : null}
    </div>
  );
}

function DtDd({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/15 px-3 py-2">
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium text-foreground">{value}</dd>
    </div>
  );
}