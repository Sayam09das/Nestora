'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { REPORT_PERIOD_FILTERS, type ReportTemplate } from '@/components/dashboard/reports/admin-reports-data';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  preselectId?: string;
  templates?: ReportTemplate[];
};

export function AdminReportsExportDrawer({ open, onOpenChange, preselectId, templates }: Props) {
  const catalog = templates ?? [];
  const [reportId, setReportId] = useState('');
  const [period, setPeriod] = useState<(typeof REPORT_PERIOD_FILTERS)[number]>('Last 30 days');
  const [format, setFormat] = useState<'CSV' | 'PDF' | 'XLSX'>('PDF');

  useEffect(() => {
    if (!open) {
      setReportId('');
      setPeriod('Last 30 days');
      setFormat('PDF');
      return;
    }
    if (preselectId) setReportId(preselectId);
  }, [open, preselectId]);

  const schedule = () => {
    if (!reportId) {
      toast.error('Select a report template.');
      return;
    }
    toast.success(`Scheduled ${format} export · ${period} (sample).`);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-md">
        <SheetHeader className="border-b p-5 text-left">
          <SheetTitle className="text-lg text-[var(--nestora-forest)]">Schedule export</SheetTitle>
          <SheetDescription>Deliver to email or download vault. Scoped by role (FR-139).</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 p-5">
          <label className="block space-y-1">
            <span className="text-xs font-medium">Report</span>
            <select value={reportId} onChange={(e) => setReportId(e.target.value)} className={cn('h-10 w-full rounded-xl border px-3 text-sm', focusRing)}>
              <option value="">Select template</option>
              {catalog.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.code} · {r.title}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium">Period</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as (typeof REPORT_PERIOD_FILTERS)[number])}
              className={cn('h-10 w-full rounded-xl border px-3 text-sm', focusRing)}
            >
              {REPORT_PERIOD_FILTERS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium">Format</span>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as 'CSV' | 'PDF' | 'XLSX')}
              className={cn('h-10 w-full rounded-xl border px-3 text-sm', focusRing)}
            >
              <option value="PDF">PDF</option>
              <option value="CSV">CSV</option>
              <option value="XLSX">XLSX</option>
            </select>
          </label>
        </div>
        <SheetFooter className="border-t p-5">
          <Button type="button" className={cn('w-full rounded-xl bg-[var(--nestora-forest)] text-white', focusRing)} onClick={schedule}>
            Queue export
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
