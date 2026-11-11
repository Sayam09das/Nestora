'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  AVAILABLE_BED_OPTIONS,
  ELIGIBLE_STUDENT_OPTIONS,
  type AllocationRecord,
} from '@/components/dashboard/allocation/admin-allocation-data';
import type { RoomRecord } from '@/components/dashboard/rooms/admin-rooms-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hostelName: string;
  presetStudentId?: string;
  presetRoom?: RoomRecord | null;
  queueRecord?: AllocationRecord | null;
};

export function WardenRoomsAllocateSheet({
  open,
  onOpenChange,
  hostelName,
  presetStudentId,
  presetRoom,
  queueRecord,
}: Props) {
  const [studentId, setStudentId] = useState('');
  const [bedId, setBedId] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');

  useEffect(() => {
    if (!open) {
      setStudentId('');
      setBedId('');
      setEffectiveDate('');
      return;
    }
    if (queueRecord) {
      setStudentId(queueRecord.studentId);
    } else if (presetStudentId) {
      setStudentId(presetStudentId);
    }
    if (presetRoom) {
      const match = AVAILABLE_BED_OPTIONS.find(
        (b) => b.hostel === hostelName && b.room === presetRoom.roomNumber,
      );
      if (match) setBedId(match.bedId);
    }
  }, [open, queueRecord, presetStudentId, presetRoom, hostelName]);

  const bedsInHostel = useMemo(
    () => AVAILABLE_BED_OPTIONS.filter((b) => b.hostel === hostelName || hostelName === ''),
    [hostelName],
  );

  const student = ELIGIBLE_STUDENT_OPTIONS.find((s) => s.studentId === studentId);
  const bed = bedsInHostel.find((b) => b.bedId === bedId);
  const valid = student?.admissionStatus === 'Fully Approved' && bed && effectiveDate;

  const save = () => {
    if (!valid) {
      toast.error('Select a fully approved student, an available bed in your hostel, and effective date.');
      return;
    }
    toast.success(`${student.name} → ${bed.label}`, {
      description: 'Allocation persists when MOD-05 API is connected. Bed becomes Occupied (FR-026).',
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-md">
        <SheetHeader className="border-b p-5 text-left">
          <SheetTitle className="text-lg text-[var(--nestora-forest)]">Assign bed</SheetTitle>
          <SheetDescription>
            Hostel-scoped assignment for <strong>{hostelName}</strong>. Double-booking is rejected at transaction level
            (FR-028).
          </SheetDescription>
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
              {bedsInHostel.map((b) => (
                <option key={b.bedId} value={b.bedId}>
                  {b.label}
                </option>
              ))}
            </select>
          </label>
          {presetRoom ? (
            <p className="rounded-xl border border-dashed border-[var(--nestora-sage-muted)] bg-muted/15 p-3 text-xs text-muted-foreground">
              Pre-selected room <strong>{presetRoom.roomNumber}</strong> — pick any open bed in this room if listed.
            </p>
          ) : null}
          <label className="block space-y-1">
            <span className="text-xs font-medium">Effective from</span>
            <Input
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className={cn('h-10 rounded-xl', focusRing)}
            />
          </label>
        </div>
        <SheetFooter className="flex-row gap-2 border-t p-5">
          <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={!valid} className="rounded-xl bg-[var(--nestora-forest)]" onClick={save}>
            Confirm allocation
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
