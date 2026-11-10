'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { AUDIT_CATEGORY_FILTERS } from '@/components/dashboard/audit-logs/admin-audit-logs-data';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = { open: boolean; onOpenChange: (o: boolean) => void };

export function AdminAuditLogsExportDrawer({ open, onOpenChange }: Props) {
  const [format, setFormat] = useState<'CSV' | 'JSON' | 'PDF'>('CSV');
  const [category, setCategory] = useState<(typeof AUDIT_CATEGORY_FILTERS)[number]>('All categories');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    if (!open) {
      setFormat('CSV');
      setCategory('All categories');
      setFrom('');
      setTo('');
    }
  }, [open]);

  const run = () => {
    toast.success(`Export queued (${format}) · compliance slice (sample).`);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-md">
        <SheetHeader className="border-b p-5 text-left">
          <SheetTitle className="text-lg text-[var(--nestora-forest)]">Export audit slice</SheetTitle>
          <SheetDescription>Download immutable entries for external compliance archive. Includes hash chain metadata.</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 p-5">
          <label className="block space-y-1">
            <span className="text-xs font-medium">Format</span>
            <select value={format} onChange={(e) => setFormat(e.target.value as typeof format)} className={cn('h-10 w-full rounded-xl border px-3 text-sm', focusRing)}>
              <option value="CSV">CSV</option>
              <option value="JSON">JSON</option>
              <option value="PDF">PDF summary</option>
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as (typeof AUDIT_CATEGORY_FILTERS)[number])}
              className={cn('h-10 w-full rounded-xl border px-3 text-sm', focusRing)}
            >
              {AUDIT_CATEGORY_FILTERS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-xs font-medium">From</span>
              <input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} className={cn('h-10 w-full rounded-xl border px-3 text-sm', focusRing)} />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium">To</span>
              <input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} className={cn('h-10 w-full rounded-xl border px-3 text-sm', focusRing)} />
            </label>
          </div>
        </div>
        <SheetFooter className="border-t p-5 sm:flex-col sm:space-x-0">
          <Button type="button" className={cn('w-full rounded-xl bg-[var(--nestora-forest)] text-white', focusRing)} onClick={run}>
            Generate export
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
