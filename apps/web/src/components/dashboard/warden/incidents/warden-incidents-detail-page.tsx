'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import {
  TYPE_META,
  formatIncidentWhen,
  type IncidentActionLogEntry,
  type IncidentDeskRecord,
  type IncidentSeverity,
} from '@/components/dashboard/incidents/incident-desk-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  acknowledgeIncident,
  markIncidentInProgress,
  patchIncidentSeverity,
  resolveIncident,
} from '@/lib/api/incidents';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

const SEVERITIES: IncidentSeverity[] = ['Low', 'Medium', 'High', 'Critical'];

type Props = {
  record: IncidentDeskRecord;
  timeline: IncidentActionLogEntry[];
  onRecordUpdated: (record: IncidentDeskRecord) => void;
};

export function WardenIncidentsDetailPage({ record: initial, timeline, onRecordUpdated }: Props) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [record, setRecord] = useState(initial);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [severity, setSeverity] = useState(record.effectiveSeverity);

  const meta = TYPE_META[record.incidentType];
  const Icon = meta.icon;

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-inc-detail]'), {
        opacity: 0,
        y: 10,
        stagger: 0.05,
        duration: 0.38,
        clearProps: 'opacity,transform',
      });
    },
    { scope: rootRef, dependencies: [reduceMotion, record.id] },
  );

  const apply = (next: IncidentDeskRecord) => {
    setRecord(next);
    setSeverity(next.effectiveSeverity);
    onRecordUpdated(next);
  };

  const run = async (fn: () => Promise<{ record?: IncidentDeskRecord; error?: string }>, ok: string) => {
    setBusy(true);
    const result = await fn();
    setBusy(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    if (result.record) {
      apply(result.record);
      toast.success(ok);
      setNote('');
    }
  };

  return (
    <div ref={rootRef} className="space-y-6 pb-8">
      <div data-inc-detail className="flex flex-wrap items-center gap-3">
        <Button
          nativeButton={false}
          variant="outline"
          size="sm"
          className="rounded-xl"
          render={<Link href="/warden/incidents" className={focusRing} />}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Incident desk
        </Button>
        <p className="text-xs text-muted-foreground">
          {record.incidentRef} · {record.hostel}
        </p>
      </div>

      <header
        data-inc-detail
        className="relative overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--destructive)_22%,var(--border))] bg-card p-6 shadow-sm"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="flex items-center gap-2 text-2xl font-semibold text-[var(--nestora-forest)]">
              <span
                className="flex size-10 items-center justify-center rounded-xl border"
                style={{
                  color: meta.accent,
                  borderColor: `color-mix(in oklch, ${meta.accent} 35%, var(--border))`,
                }}
              >
                <Icon className="size-5" aria-hidden />
              </span>
              {record.title}
            </h1>
            <p className="text-sm text-muted-foreground">{record.description}</p>
            <motion.div className="flex flex-wrap gap-2 pt-1">
              <Badge variant="outline">{record.incidentType}</Badge>
              <Badge variant={record.effectiveSeverity === 'Critical' || record.effectiveSeverity === 'High' ? 'destructive' : 'outline'}>
                {record.effectiveSeverity}
              </Badge>
              <Badge variant="secondary">{record.status}</Badge>
              {record.isEscalated ? (
                <Badge variant="destructive" className="gap-1">
                  <ShieldAlert className="size-3" aria-hidden />
                  Escalated
                </Badge>
              ) : null}
            </motion.div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p>Reported {formatIncidentWhen(record.reportedAt)}</p>
            <p>By {record.reportedByName}</p>
            <p className="mt-1">Location · {record.location}</p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr,18rem]">
        <section data-inc-detail className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">Action timeline</h2>
          <p className="text-xs text-muted-foreground">FR-113 · audited response trail</p>
          <ol className="mt-4 space-y-3">
            {timeline.length === 0 ? (
              <li className="text-sm text-muted-foreground">No actions logged yet.</li>
            ) : (
              timeline.map((entry) => (
                <li key={entry.id} className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2.5">
                  <p className="text-sm text-foreground">{entry.actionTaken}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {entry.actorName} · {formatIncidentWhen(entry.at)}
                  </p>
                </li>
              ))
            )}
          </ol>
        </section>

        <aside data-inc-detail className="space-y-4">
          {record.status !== 'Resolved' ? (
            <motion.div className="rounded-2xl border bg-card p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">Warden controls</h2>
              <label className="mt-3 block text-xs font-medium text-muted-foreground">
                Official severity
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
                  className={cn('mt-1 h-9 w-full rounded-lg border bg-card px-2 text-sm', focusRing)}
                  disabled={busy}
                >
                  {SEVERITIES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-2 w-full rounded-lg"
                disabled={busy || severity === record.effectiveSeverity}
                onClick={() =>
                  void run(
                    () => patchIncidentSeverity(record.id, { officialSeverity: severity }),
                    'Severity updated.',
                  )
                }
              >
                Save severity
              </Button>
              <label className="mt-4 block text-xs font-medium text-muted-foreground">
                Response notes
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Actions taken, units notified, residents moved…"
                  className="mt-1 min-h-[88px] rounded-xl"
                  disabled={busy}
                />
              </label>
              <div className="mt-3 space-y-2">
                {record.status === 'Reported' ? (
                  <Button
                    type="button"
                    className="w-full rounded-xl bg-[var(--nestora-forest)] text-white"
                    disabled={busy}
                    onClick={() => void run(() => acknowledgeIncident(record.id), 'Incident acknowledged.')}
                  >
                    Acknowledge
                  </Button>
                ) : null}
                {record.status === 'Acknowledged' ? (
                  <Button
                    type="button"
                    className="w-full rounded-xl bg-[var(--nestora-forest)] text-white"
                    disabled={busy || note.trim().length < 3}
                    onClick={() =>
                      void run(() => markIncidentInProgress(record.id, note.trim()), 'Marked in progress.')
                    }
                  >
                    Start on-site response
                  </Button>
                ) : null}
                {record.status === 'In progress' || record.status === 'Acknowledged' ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-xl"
                    disabled={busy || note.trim().length < 3}
                    onClick={() => void run(() => resolveIncident(record.id, note.trim()), 'Incident resolved.')}
                  >
                    Mark resolved
                  </Button>
                ) : null}
              </div>
            </motion.div>
          ) : (
            <p className="rounded-2xl border bg-muted/30 p-4 text-sm text-muted-foreground">
              This incident is closed. Reopen via admin audit if needed.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
