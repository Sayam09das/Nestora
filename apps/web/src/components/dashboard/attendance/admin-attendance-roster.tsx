'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { useRef } from 'react';

import {
  CONSECUTIVE_ALERT_THRESHOLD,
  nextMark,
  type AttendanceMark,
  type AttendanceRosterRow,
} from '@/components/dashboard/attendance/admin-attendance-data';
import { getStudentInitials } from '@/components/dashboard/students/admin-students-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

const markStyles: Record<AttendanceMark, string> = {
  Present: 'bg-[color-mix(in_oklch,var(--nestora-sage-light)_50%,var(--card))] text-[var(--nestora-forest)] border-[color-mix(in_oklch,var(--nestora-sage)_35%,var(--border))]',
  Absent: 'bg-destructive/10 text-destructive border-destructive/30',
  'On Leave': 'bg-[color-mix(in_oklch,var(--nestora-gold)_18%,var(--card))] text-[var(--nestora-forest)] border-[color-mix(in_oklch,var(--nestora-gold)_35%,var(--border))]',
  Unmarked: 'bg-muted/50 text-muted-foreground border-border',
};

type Props = {
  rows: AttendanceRosterRow[];
  onMarkChange: (id: string, mark: AttendanceMark) => void;
  listKey: string;
};

export function AdminAttendanceRoster({ rows, onMarkChange, listKey }: Props) {
  const reduceMotion = useReducedMotion();
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reduceMotion || !gridRef.current || !rows.length) return;
      gsap.from(gridRef.current.querySelectorAll('.att-roster-card'), {
        opacity: 0,
        scale: 0.94,
        y: 10,
        stagger: { each: 0.04, grid: 'auto' },
        duration: 0.35,
        ease: 'back.out(1.1)',
        clearProps: 'opacity,transform',
      });
    },
    { scope: gridRef, dependencies: [listKey, rows.length, reduceMotion] },
  );

  return (
    <section data-att-reveal className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_22%,var(--border))] bg-card shadow-sm">
      <div className="border-b border-[var(--nestora-sage-muted)]/70 px-4 py-4 sm:px-5">
        <h2 className="text-base font-semibold text-[var(--nestora-forest)]">Tonight’s roster</h2>
        <p className="text-xs text-muted-foreground">Tap a status chip to cycle Present → Absent → On Leave.</p>
      </div>
      <div ref={gridRef} className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:p-5">
        {rows.map((row) => (
          <motion.article
            key={row.id}
            className="att-roster-card flex flex-col gap-3 rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] p-3 shadow-sm"
            whileHover={reduceMotion ? undefined : { y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          >
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--nestora-forest)] text-xs font-bold text-white">
                {getStudentInitials(row.studentName)}
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{row.studentName}</p>
                <p className="text-xs text-muted-foreground">
                  {row.roomNumber} · {row.floor}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onMarkChange(row.id, nextMark(row.mark))}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                markStyles[row.mark],
                focusRing,
              )}
              aria-label={`${row.studentName} attendance: ${row.mark}. Click to change.`}
            >
              {row.mark}
            </button>
            {row.onApprovedLeave && row.mark !== 'On Leave' ? (
              <p className="text-[10px] text-[var(--nestora-sage)]">Approved leave on file — consider On Leave</p>
            ) : null}
            {row.consecutiveUnexplained >= CONSECUTIVE_ALERT_THRESHOLD && row.mark === 'Absent' ? (
              <p className="flex items-center gap-1 text-[10px] font-medium text-destructive">
                <AlertTriangle className="size-3" aria-hidden />
                {row.consecutiveUnexplained}-day unexplained streak
              </p>
            ) : null}
          </motion.article>
        ))}
      </div>
      {rows.length === 0 ? <p className="px-5 pb-8 text-center text-sm text-muted-foreground">No residents match filters.</p> : null}
    </section>
  );
}
