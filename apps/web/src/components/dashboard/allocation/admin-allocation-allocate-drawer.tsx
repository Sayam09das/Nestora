'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  AVAILABLE_BED_OPTIONS,
  ELIGIBLE_STUDENT_OPTIONS,
  SAMPLE_ALLOCATIONS,
  generateAllocationRef,
} from '@/components/dashboard/allocation/admin-allocation-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = { open: boolean; onOpenChange: (o: boolean) => void };

export function AdminAllocationAllocateDrawer({ open, onOpenChange }: Props) {
  const [studentId, setStudentId] = useState('');
  const [bedId, setBedId] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');

  useEffect(() => {
    if (!open) {
      setStudentId('');
      setBedId('');
      setEffectiveDate('');
    }
  }, [open]);

  const student = ELIGIBLE_STUDENT_OPTIONS.find((s) => s.studentId === studentId);
  const bed = AVAILABLE_BED_OPTIONS.find((b) => b.bedId === bedId);
  const valid = student && bed && effectiveDate;

  const save = () => {
    if (!valid) {
      toast.error('Select a fully approved student, an available bed, and effective date.');
      return;
    }
    const ref = generateAllocationRef(SAMPLE_ALLOCATIONS.length + 1);
    toast.success(`${ref}: ${student.name} → ${bed.bedId} (sample UI). Bed status would become Occupied.`);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-md">
        <SheetHeader className="border-b p-5 text-left">
          <SheetTitle className="text-lg text-[var(--nestora-forest)]">Assign bed</SheetTitle>
          <SheetDescription>Only Fully Approved students and Available beds (or approved reservations) are eligible.</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 p-5">
          <label className="block space-y-1">
            <span className="text-xs font-medium">Student (Fully Approved)</span>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className={cn('h-10 w-full rounded-xl border px-3 text-sm', focusRing)}
            >
              <option value="">Select student</option>
              {ELIGIBLE_STUDENT_OPTIONS.map((s) => (
                <option key={s.studentId} value={s.studentId}>
                  {s.studentId} · {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium">Available bed</span>
            <select
              value={bedId}
              onChange={(e) => setBedId(e.target.value)}
              className={cn('h-10 w-full rounded-xl border px-3 text-sm', focusRing)}
            >
              <option value="">Select bed</option>
              {AVAILABLE_BED_OPTIONS.map((b) => (
                <option key={b.bedId} value={b.bedId}>
                  {b.label} · {b.hostel}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium">Effective from</span>
            <Input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} className={cn('h-10 rounded-xl', focusRing)} />
          </label>
          <p className="rounded-xl border border-dashed border-[var(--nestora-sage-muted)] bg-muted/15 p-3 text-[11px] text-muted-foreground">
            Double-booking is rejected at transaction level. Partial per-bed assignment in multi-bed rooms is supported
            (FR-027).
          </p>
        </div>
        <SheetFooter className="flex-row gap-2 border-t p-5">
          <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={!valid} className="rounded-xl bg-[var(--nestora-forest)] text-white" onClick={save}>
            Confirm allocation
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
