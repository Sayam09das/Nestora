'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, UserCheck } from 'lucide-react';
import Link from 'next/link';

import type { WardenDashboardSnapshot } from '@/components/dashboard/warden/home/warden-dashboard-data';
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

const motionEase = [0.22, 1, 0.36, 1] as const;

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = { snapshot: WardenDashboardSnapshot };

export function WardenDashboardAdmissionsQueue({ snapshot }: Props) {
  const reduceMotion = useReducedMotion();
  const { pending, admissionsQueue } = snapshot;

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: motionEase }}
      className="flex h-full flex-col rounded-2xl border border-[color-mix(in_oklch,var(--nestora-forest)_18%,var(--border))] bg-card p-5 shadow-sm"
      aria-labelledby="warden-admissions-heading"
    >
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="warden-admissions-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
            Second-tier admission verifications
          </h2>
          <p className="text-sm text-muted-foreground">
            Admin-verified applications awaiting warden sign-off (FR-124)
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/40 px-2.5 py-0.5 text-xs font-semibold text-foreground">
          <UserCheck className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
          {pending.admissions} pending
        </span>
      </div>

      {admissionsQueue.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
          No applications awaiting warden verification.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-border/70">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-bold uppercase tracking-wide">Student</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wide">Reg. no.</TableHead>
                <TableHead className="hidden text-xs font-bold uppercase tracking-wide sm:table-cell">Course</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wide">Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admissionsQueue.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-muted-foreground">{row.registrationNo}</TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">{row.course}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{row.submittedAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Button
        nativeButton={false}
        render={
          <Link
            href="/warden/students"
            className={cn('mt-4 inline-flex w-full items-center justify-center gap-2 sm:w-auto', focusRing)}
          />
        }
        variant="outline"
        size="sm"
      >
        Review admission queue
        <ArrowRight className="size-4" aria-hidden />
      </Button>
    </motion.section>
  );
}
