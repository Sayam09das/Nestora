'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import type { AllocationRecord } from '@/components/dashboard/allocation/admin-allocation-data';
import type { RoomRecord } from '@/components/dashboard/rooms/admin-rooms-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAllocationAssignOptions } from '@/hooks/use-allocation-assign-options';
import { assignStudentToBed } from '@/lib/api/allocations';
import { approveRoomChange } from '@/lib/api/room-changes';
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
  roomChangeRequestId?: string | null;
  onAssigned?: () => void;
};

export function WardenRoomsAllocateSheet({
  open,
  onOpenChange,
  hostelName,
  presetStudentId,
  presetRoom,
  queueRecord,
  roomChangeRequestId,
  onAssigned,
}: Props) {
  const [studentUserId, setStudentUserId] = useState('');
  const [bedId, setBedId] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { students, beds, loading, error } = useAllocationAssignOptions(hostelName, open);

  useEffect(() => {
    if (!open) {
      setStudentUserId('');
      setBedId('');
      setEffectiveDate('');
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    setEffectiveDate(today);
    if (queueRecord?.studentUserId) {
      setStudentUserId(queueRecord.studentUserId);
    } else if (presetStudentId && students.length > 0) {
      const match = students.find((s) => s.studentId === presetStudentId);
      if (match?.studentUserId) setStudentUserId(match.studentUserId);
    }
    if (presetRoom) {
      const match = beds.find((b) => b.roomNumber === presetRoom.roomNumber);
      if (match) setBedId(match.bedId);
    }
  }, [open, queueRecord, presetStudentId, presetRoom, students, beds]);

  const student = useMemo(
    () => students.find((s) => s.studentUserId === studentUserId),
    [students, studentUserId],
  );
  const bed = useMemo(() => beds.find((b) => b.bedId === bedId), [beds, bedId]);
  const valid = Boolean(student && bed && effectiveDate);

  const save = async () => {
    if (!valid || !studentUserId || !bedId) {
      toast.error('Select a fully approved student, an available bed in your hostel, and effective date.');
      return;
    }
    setSubmitting(true);
    const result = roomChangeRequestId
      ? await approveRoomChange(roomChangeRequestId, { bedId })
      : await assignStudentToBed({
          studentUserId,
          bedId,
          startDate: effectiveDate,
        });
    setSubmitting(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`${student?.studentName ?? 'Student'} → ${bed?.label ?? 'Bed'}`, {
      description: roomChangeRequestId
        ? 'Room change approved with atomic transfer (MOD-05).'
        : 'Bed marked occupied and allocation saved (MOD-05).',
    });
    onAssigned?.();
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
          {error ? (
            <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          ) : null}
          {loading ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Loading eligible students and beds…
            </p>
          ) : null}
          <label className="block space-y-1">
            <span className="text-xs font-medium">Student (Fully Approved)</span>
            <select
              value={studentUserId}
              onChange={(e) => setStudentUserId(e.target.value)}
              disabled={loading || students.length === 0}
              className={cn('h-10 w-full rounded-xl border px-3 text-sm', focusRing)}
            >
              <option value="">Select student</option>
              {students.map((s) => (
                <option key={s.studentUserId} value={s.studentUserId}>
                  {s.studentId} · {s.studentName}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium">Available bed</span>
            <select
              value={bedId}
              onChange={(e) => setBedId(e.target.value)}
              disabled={loading || beds.length === 0}
              className={cn('h-10 w-full rounded-xl border px-3 text-sm', focusRing)}
            >
              <option value="">Select bed</option>
              {beds.map((b) => (
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
          <Button
            type="button"
            disabled={!valid || submitting || loading}
            className="rounded-xl bg-[var(--nestora-forest)]"
            onClick={() => void save()}
          >
            {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            Confirm allocation
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}