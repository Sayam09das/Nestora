'use client';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';

import {
  TYPE_META,
  formatIncidentWhen,
  type IncidentDeskRecord,
} from '@/components/dashboard/incidents/incident-desk-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

function severityVariant(severity: IncidentDeskRecord['effectiveSeverity']) {
  if (severity === 'Critical' || severity === 'High') return 'destructive' as const;
  return 'outline' as const;
}

type Props = {
  rows: IncidentDeskRecord[];
  busyId: string | null;
  onAcknowledge: (id: string) => void;
  onInProgress: (id: string) => void;
};

export function WardenIncidentsDirectory({ rows, busyId, onAcknowledge, onInProgress }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--destructive)_15%,var(--border))] bg-card shadow-sm">
      <div className="overflow-x-auto">
        <Table className="min-w-[52rem]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[10px] font-bold uppercase tracking-wide">Incident</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wide">Type</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wide">Location</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wide">Severity</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wide">Status</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wide">Reported</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wide">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const meta = TYPE_META[row.incidentType];
              const Icon = meta.icon;
              const busy = busyId === row.id;
              return (
                <TableRow key={row.id} className="hover:bg-[color-mix(in_oklch,var(--destructive)_4%,var(--card))]">
                  <TableCell className="max-w-[14rem]">
                    <Link
                      href={`/warden/incidents/${row.id}`}
                      className={cn('block font-medium text-[var(--nestora-forest)]', focusRing)}
                    >
                      <span className="block text-[11px] text-muted-foreground">{row.incidentRef}</span>
                      {row.title}
                      {row.isEscalated ? (
                        <Badge variant="outline" className="ml-2 text-[10px]">
                          Escalated
                        </Badge>
                      ) : null}
                    </Link>
                    <p className="mt-1 text-[11px] text-muted-foreground">By {row.reportedByName}</p>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <Icon className="size-3.5" style={{ color: meta.accent }} aria-hidden />
                      {row.incidentType}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{row.location}</TableCell>
                  <TableCell>
                    <Badge variant={severityVariant(row.effectiveSeverity)} className="text-[10px] font-semibold uppercase">
                      {row.effectiveSeverity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{row.status}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatIncidentWhen(row.reportedAt)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {row.status === 'Reported' ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-8 rounded-lg text-xs"
                          disabled={busy}
                          onClick={() => onAcknowledge(row.id)}
                        >
                          {busy ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : 'Acknowledge'}
                        </Button>
                      ) : null}
                      {row.status === 'Acknowledged' ? (
                        <Button
                          type="button"
                          size="sm"
                          className="h-8 rounded-lg bg-[var(--nestora-forest)] text-xs text-white"
                          disabled={busy}
                          onClick={() => onInProgress(row.id)}
                        >
                          {busy ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : 'Start response'}
                        </Button>
                      ) : null}
                      <Button
                        nativeButton={false}
                        size="sm"
                        variant="ghost"
                        className="h-8 rounded-lg text-xs"
                        render={<Link href={`/warden/incidents/${row.id}`} className={focusRing} />}
                      >
                        Open
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
