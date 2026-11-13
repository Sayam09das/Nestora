'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  VISITOR_STATUS_STYLES,
  formatVisitorTime,
  type VisitorDeskRecord,
} from '@/components/dashboard/visitors/visitor-desk-data';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  rows: VisitorDeskRecord[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onCheckIn: (id: string) => void;
  onCheckOut: (id: string) => void;
  busyId?: string | null;
};

export function WardenVisitorsDirectory({ rows, onApprove, onReject, onCheckIn, onCheckOut, busyId }: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[52rem] text-left text-sm">
          <thead>
            <tr className="border-b bg-[color-mix(in_oklch,var(--nestora-cream)_15%,var(--card))] text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-4 py-3">Visitor</th>
              <th className="px-4 py-3">Resident</th>
              <th className="px-4 py-3">Purpose</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Gate times</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b last:border-0 hover:bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--card))]">
                <td className="px-4 py-3">
                  <p className="font-medium text-[var(--nestora-forest)]">{row.visitorName}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {row.visitorRef} · {row.visitorPhone}
                  </p>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {row.studentName}
                  <span className="block text-[11px]">{row.roomBed}</span>
                </td>
                <td className="max-w-[12rem] px-4 py-3 text-xs text-muted-foreground">
                  <span className="line-clamp-2">{row.purpose}</span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={cn('rounded-full text-xs', VISITOR_STATUS_STYLES[row.status])}>
                    {row.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-[11px] tabular-nums text-muted-foreground">
                  {row.checkInTime ? `In ${formatVisitorTime(row.checkInTime)}` : '—'}
                  <span className="block">
                    {row.checkOutTime ? `Out ${formatVisitorTime(row.checkOutTime)}` : row.checkInTime ? 'Still inside' : '—'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {row.status === 'Pending Approval' ? (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          className={cn('h-8 rounded-lg text-xs', focusRing)}
                          disabled={busyId === row.id}
                          onClick={() => onApprove(row.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className={cn('h-8 rounded-lg text-xs', focusRing)}
                          disabled={busyId === row.id}
                          onClick={() => onReject(row.id)}
                        >
                          Reject
                        </Button>
                      </>
                    ) : null}
                    {row.status === 'Approved' ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className={cn('h-8 rounded-lg text-xs', focusRing)}
                        disabled={busyId === row.id}
                        onClick={() => onCheckIn(row.id)}
                      >
                        Check in
                      </Button>
                    ) : null}
                    {row.status === 'Inside' ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className={cn('h-8 rounded-lg text-xs', focusRing)}
                        disabled={busyId === row.id}
                        onClick={() => onCheckOut(row.id)}
                      >
                        Check out
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 ? (
        <p className="p-8 text-center text-sm text-muted-foreground">No visitor records for today match your filters.</p>
      ) : null}
    </section>
  );
}
