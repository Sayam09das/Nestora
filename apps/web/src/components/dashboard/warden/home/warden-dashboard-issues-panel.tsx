'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import type { WardenDashboardSnapshot, WardenIssueRow } from '@/components/dashboard/warden/home/warden-dashboard-data';
import { Badge } from '@/components/ui/badge';
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

function priorityVariant(priority: WardenIssueRow['priority']) {
  switch (priority) {
    case 'High':
      return 'destructive' as const;
    case 'Medium':
      return 'outline' as const;
    default:
      return 'secondary' as const;
  }
}

type Props = { snapshot: WardenDashboardSnapshot };

export function WardenDashboardIssuesPanel({ snapshot }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: motionEase }}
      className="rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card p-5 shadow-sm"
      aria-labelledby="warden-issues-heading"
    >
      <motion.div className="flex flex-wrap items-end justify-between gap-2">
        <motion.div>
          <h2 id="warden-issues-heading" className="text-base font-semibold text-[var(--nestora-forest)]">
            Recent complaints &amp; maintenance
          </h2>
          <p className="text-sm text-muted-foreground">Issues that require attention in your hostel</p>
        </motion.div>
        <Link
          href="/warden/complaints"
          className={cn(
            'inline-flex items-center gap-1 text-sm font-semibold text-[var(--nestora-sage)] hover:text-[var(--nestora-forest)]',
            focusRing,
          )}
        >
          View all issues
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </motion.div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border/70">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-bold uppercase tracking-wide">Issue</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wide">Room</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wide">Priority</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wide">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {snapshot.issues.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium text-foreground">{row.issue}</TableCell>
                <TableCell className="tabular-nums text-muted-foreground">{row.room}</TableCell>
                <TableCell>
                  <Badge variant={priorityVariant(row.priority)} className="text-[10px] font-semibold uppercase">
                    {row.priority}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{row.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.section>
  );
}
