'use client';

import { History } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

import { formatAttendanceDate, formatAttendanceDateTime, sessionRate, type AttendanceSession } from '@/components/dashboard/attendance/admin-attendance-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
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

export function AdminAttendanceSessionsDirectory({ sessions }: { sessions: AttendanceSession[] }) {
  const bodyRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!bodyRef.current) return;
      gsap.from(bodyRef.current.querySelectorAll('[data-att-session-row]'), {
        opacity: 0,
        y: 8,
        stagger: 0.03,
        duration: 0.32,
        clearProps: 'opacity,transform',
      });
    },
    { scope: bodyRef, dependencies: [sessions.length] },
  );

  return (
    <section data-att-reveal className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-[var(--nestora-sage-muted)]/70 px-4 py-4 sm:px-5">
        <History className="size-4 text-[var(--nestora-sage)]" aria-hidden />
        <h2 className="text-base font-semibold text-[var(--nestora-forest)]">Recent sessions</h2>
      </div>
      <div ref={bodyRef} className="overflow-x-auto p-4 sm:p-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Hostel</TableHead>
              <TableHead>Block / Floor</TableHead>
              <TableHead>Present</TableHead>
              <TableHead>Absent</TableHead>
              <TableHead>On leave</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((s) => (
              <TableRow key={s.id} data-att-session-row>
                <TableCell>{formatAttendanceDate(s.date)}</TableCell>
                <TableCell>{s.hostel}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {s.block} · {s.floor}
                </TableCell>
                <TableCell className="tabular-nums">{s.present}</TableCell>
                <TableCell className="tabular-nums">{s.absent}</TableCell>
                <TableCell className="tabular-nums">{s.onLeave}</TableCell>
                <TableCell className="tabular-nums font-medium">{sessionRate(s)}%</TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn('rounded-full', s.status === 'Published' ? 'text-[var(--nestora-forest)]' : '')}>
                    {s.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button nativeButton={false} size="sm" variant="outline" className="h-8 rounded-lg text-xs" render={<Link href={`/admin/attendance/sessions/${s.id}`} className={focusRing} />}>
                    View
                  </Button>
                  <span className="sr-only">{formatAttendanceDateTime(s.submittedAt)}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
