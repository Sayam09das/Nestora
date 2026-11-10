'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { AdminReportsExportDrawer } from '@/components/dashboard/reports/admin-reports-export-drawer';
import { AdminReportsPreviewPanel } from '@/components/dashboard/reports/admin-reports-preview-panel';
import {
  CATEGORY_META,
  SAMPLE_TABLE_ROWS,
  formatReportWhen,
  type ReportTemplate,
} from '@/components/dashboard/reports/admin-reports-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

export function AdminReportsDetailPage({ report }: { report: ReportTemplate }) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const meta = CATEGORY_META[report.category];
  const Icon = meta.icon;
  const rows = SAMPLE_TABLE_ROWS[report.id] ?? [];

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-rpt-detail]'), {
        opacity: 0,
        y: 10,
        stagger: 0.05,
        duration: 0.38,
        clearProps: 'opacity,transform',
      });
    },
    { scope: rootRef, dependencies: [reduceMotion, report.id] },
  );

  return (
    <div ref={rootRef} className="space-y-6 pb-8">
      <div data-rpt-detail className="flex flex-wrap items-center gap-3">
        <Button nativeButton={false} variant="outline" size="sm" className="rounded-xl" render={<Link href="/admin/reports" className={focusRing} />}>
          <ArrowLeft className="size-4" aria-hidden />
          Reports
        </Button>
        <p className="text-xs text-muted-foreground">
          {report.code} · <span className="font-medium text-foreground">{report.frRef}</span>
        </p>
      </div>

      <header data-rpt-detail className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold text-[var(--nestora-forest)]">
              <Icon className="size-6" style={{ color: meta.accent }} aria-hidden />
              {report.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{report.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-full">
              {report.format}
            </Badge>
            <Badge variant="outline" className="rounded-full">
              {report.hostelScoped ? 'Hostel-scoped' : 'University-wide'}
            </Badge>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" className={cn('rounded-xl bg-[var(--nestora-forest)] text-white', focusRing)} onClick={() => setDrawerOpen(true)}>
            <Download className="size-4" aria-hidden />
            Export
          </Button>
          <Button type="button" variant="outline" className={cn('rounded-xl', focusRing)} onClick={() => toast.success('Report re-run (sample).')}>
            Re-run now
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Last generated <time dateTime={report.lastRun}>{formatReportWhen(report.lastRun)}</time> · Refresh {report.refresh}
        </p>
      </header>

      <div data-rpt-detail>
        <AdminReportsPreviewPanel report={report} />
      </div>

      {rows.length > 0 ? (
        <motion.section
          data-rpt-detail
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl border bg-card shadow-sm"
        >
          <div className="border-b px-5 py-4">
            <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">Detail table (sample)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-[10px] font-bold uppercase text-muted-foreground">
                  {Object.keys(rows[0] ?? {}).map((key) => (
                    <th key={key} className="px-4 py-3">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-b last:border-0">
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="px-4 py-3 text-muted-foreground tabular-nums">
                        {typeof val === 'number' ? val.toLocaleString('en-IN') : val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>
      ) : null}

      <AdminReportsExportDrawer open={drawerOpen} onOpenChange={setDrawerOpen} preselectId={report.id} />
    </div>
  );
}
