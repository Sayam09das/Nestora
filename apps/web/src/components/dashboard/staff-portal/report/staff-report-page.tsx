'use client';

import { AlertTriangle, RefreshCw, Send } from 'lucide-react';
import { useState } from 'react';

import { StaffDashboardLiveStatus } from '@/components/dashboard/staff-portal/home/staff-dashboard-live-status';
import { useStaffShell } from '@/components/dashboard/staff-portal/staff-shell-provider';
import {
  formatIncidentWhen,
  INCIDENT_SEVERITY_FILTERS,
  INCIDENT_TYPE_FILTERS,
  TYPE_META,
  type IncidentSeverity,
  type IncidentType,
} from '@/components/dashboard/incidents/incident-desk-data';
import { Button } from '@/components/ui/button';
import { useStaffReportDesk } from '@/hooks/use-staff-report-desk';
import { submitStaffReport, type StaffReportIncidentInput } from '@/lib/api/dashboard';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

const REPORT_TYPES = INCIDENT_TYPE_FILTERS.filter((t) => t !== 'All Types') as IncidentType[];
const REPORT_SEVERITIES = INCIDENT_SEVERITY_FILTERS.filter((s) => s !== 'All Severities') as IncidentSeverity[];

const STATUS_CLASS: Record<string, string> = {
  Reported:
    'border-[color-mix(in_oklch,var(--nestora-gold)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_12%,var(--card))] text-[var(--nestora-forest)]',
  Acknowledged:
    'border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage)_12%,var(--card))] text-[var(--nestora-forest)]',
  'In progress':
    'border-[color-mix(in_oklch,#2563eb_35%,var(--border))] bg-[color-mix(in_oklch,#2563eb_10%,var(--card))] text-blue-900 dark:text-blue-100',
  Resolved:
    'border-[color-mix(in_oklch,emerald_55%_30%,var(--border))] bg-[color-mix(in_oklch,emerald_50%_10%,var(--card))] text-emerald-800 dark:text-emerald-200',
};

const defaultForm = (): StaffReportIncidentInput => ({
  title: '',
  description: '',
  location: '',
  incidentType: 'Security',
  initialSeverity: 'Medium',
});

export function StaffReportPage() {
  const { workplaceName } = useStaffShell();
  const { desk, loading, error, refresh } = useStaffReportDesk();
  const [form, setForm] = useState<StaffReportIncidentInput>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const hostelLabel = desk?.defaultHostelName ?? (workplaceName !== 'Assigned hostel' ? workplaceName : 'your hostel');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);
    setSubmitting(true);
    try {
      const result = await submitStaffReport(form);
      if (result.error) {
        setSubmitError(result.error);
        return;
      }
      setForm(defaultForm());
      setSubmitSuccess(
        result.record
          ? `Report ${result.record.incidentRef} submitted. The warden desk will pick it up shortly.`
          : 'Issue reported successfully.',
      );
      await refresh();
    } catch {
      setSubmitError('Could not submit the report. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 pb-4">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--nestora-forest)] sm:text-2xl">Report an Issue</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Log safety, maintenance, or security issues for {hostelLabel}. Wardens see live incidents on their desk.
            Updates every 20 seconds.
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
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Your open reports</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-[var(--nestora-forest)]">{desk.summary.myOpen}</p>
          </div>
          <div className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Submitted by you</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-[var(--nestora-forest)]">{desk.summary.myTotal}</p>
          </div>
          <div className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Active in hostel</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-[var(--nestora-forest)]">{desk.summary.hostelActive}</p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-12">
        <section className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card p-5 shadow-sm lg:col-span-5">
          <h2 className="text-base font-semibold text-[var(--nestora-forest)]">New report</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Reports are routed to the warden incidents desk for {hostelLabel}.
          </p>

          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="report-type" className="text-sm font-medium text-[var(--nestora-forest)]">
                Type
              </label>
              <select
                id="report-type"
                className={cn(
                  'mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm',
                  focusRing,
                )}
                value={form.incidentType}
                onChange={(e) => setForm((prev) => ({ ...prev, incidentType: e.target.value as IncidentType }))}
              >
                {REPORT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="report-severity" className="text-sm font-medium text-[var(--nestora-forest)]">
                Severity
              </label>
              <select
                id="report-severity"
                className={cn(
                  'mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm',
                  focusRing,
                )}
                value={form.initialSeverity}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, initialSeverity: e.target.value as IncidentSeverity }))
                }
              >
                {REPORT_SEVERITIES.map((severity) => (
                  <option key={severity} value={severity}>
                    {severity}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="report-title" className="text-sm font-medium text-[var(--nestora-forest)]">
                Title
              </label>
              <input
                id="report-title"
                required
                minLength={3}
                maxLength={150}
                className={cn(
                  'mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm',
                  focusRing,
                )}
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Brief summary"
              />
            </div>

            <div>
              <label htmlFor="report-location" className="text-sm font-medium text-[var(--nestora-forest)]">
                Location
              </label>
              <input
                id="report-location"
                required
                minLength={2}
                maxLength={150}
                className={cn(
                  'mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm',
                  focusRing,
                )}
                value={form.location}
                onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="Block, floor, or zone"
              />
            </div>

            <div>
              <label htmlFor="report-description" className="text-sm font-medium text-[var(--nestora-forest)]">
                Description
              </label>
              <textarea
                id="report-description"
                required
                minLength={10}
                rows={4}
                className={cn(
                  'mt-1 w-full resize-y rounded-xl border border-input bg-background px-3 py-2 text-sm',
                  focusRing,
                )}
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="What happened, who is affected, and any immediate risks"
              />
            </div>

            {submitError ? (
              <p className="text-sm text-destructive" role="alert">
                {submitError}
              </p>
            ) : null}
            {submitSuccess ? (
              <p className="text-sm text-emerald-700 dark:text-emerald-300" role="status">
                {submitSuccess}
              </p>
            ) : null}

            <Button type="submit" className={cn('w-full gap-2 sm:w-auto', focusRing)} disabled={submitting}>
              <Send className="size-4" aria-hidden />
              {submitting ? 'Submitting…' : 'Submit to warden desk'}
            </Button>
          </form>
        </section>

        <section
          className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card p-5 shadow-sm lg:col-span-7"
          aria-labelledby="staff-reports-heading"
        >
          <h2 id="staff-reports-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
            Your recent reports
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Status updates when the warden acknowledges or resolves.</p>

          {desk && desk.records.length === 0 ? (
            <div className="mt-6 flex flex-col items-center gap-2 rounded-xl border border-dashed border-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--border))] bg-muted/30 px-4 py-10 text-center">
              <AlertTriangle className="size-8 text-muted-foreground" aria-hidden />
              <p className="text-sm text-muted-foreground">No reports yet. Use the form to notify the warden.</p>
            </div>
          ) : null}

          <ul className="mt-4 space-y-3">
            {desk?.records.map((record) => {
              const meta = TYPE_META[record.incidentType];
              const Icon = meta.icon;
              return (
                <li
                  key={record.id}
                  className="rounded-xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-cream)_6%,var(--card))] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `color-mix(in oklch, ${meta.accent} 18%, transparent)` }}
                      >
                        <Icon className="size-4" style={{ color: meta.accent }} aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-[var(--nestora-forest)]">{record.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {record.incidentRef} · {record.location} · {formatIncidentWhen(record.reportedAt)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                        STATUS_CLASS[record.status] ?? STATUS_CLASS.Reported,
                      )}
                    >
                      {record.status}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{record.description}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {record.incidentType} · {record.effectiveSeverity} severity
                    {record.isEscalated ? ' · Escalated' : ''}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}