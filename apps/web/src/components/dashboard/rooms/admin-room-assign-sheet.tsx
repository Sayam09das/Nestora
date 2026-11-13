'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import type { RoomRecord } from '@/components/dashboard/rooms/admin-rooms-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { assignStudentToBed } from '@/lib/api/allocations';
import { fetchInfrastructureRoomBeds, type InfrastructureBedRow } from '@/lib/api/rooms';
import { fetchStudentDirectoryList } from '@/lib/api/students';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type EligibleStudent = { id: string; studentId: string; name: string };

type AdminRoomAssignSheetProps = {
  room: RoomRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssigned: () => void | Promise<void>;
};

export function AdminRoomAssignSheet({ room, open, onOpenChange, onAssigned }: AdminRoomAssignSheetProps) {
  const [beds, setBeds] = useState<InfrastructureBedRow[]>([]);
  const [students, setStudents] = useState<EligibleStudent[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [studentUserId, setStudentUserId] = useState('');
  const [bedId, setBedId] = useState('');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  const availableBeds = useMemo(() => beds.filter((b) => b.status === 'AVAILABLE'), [beds]);

  useEffect(() => {
    if (!open || !room) {
      return;
    }
    setStudentUserId('');
    setBedId('');
    setStartDate(new Date().toISOString().slice(0, 10));
    setLoadingOptions(true);

    void (async () => {
      const [bedsResult, studentsResult] = await Promise.all([
        fetchInfrastructureRoomBeds(room.id),
        fetchStudentDirectoryList({
          page: 1,
          limit: 100,
          hostel: 'Not allocated',
          status: 'Active',
        }),
      ]);
      setBeds(bedsResult.beds ?? []);
      setStudents(
        (studentsResult.students ?? []).map((s) => ({
          id: s.id,
          studentId: s.studentId,
          name: s.name,
        })),
      );
      setLoadingOptions(false);
      if (bedsResult.error) {
        toast.error(bedsResult.error);
      }
      if (studentsResult.error) {
        toast.error(studentsResult.error);
      }
    })();
  }, [open, room]);

  const canSave =
    Boolean(room && studentUserId && bedId && startDate && !saving && availableBeds.length > 0 && students.length > 0);

  const save = async () => {
    if (!room || !canSave) {
      return;
    }
    setSaving(true);
    const result = await assignStudentToBed({
      studentUserId,
      bedId,
      startDate,
    });
    setSaving(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`Student assigned to ${room.roomNumber}.`);
    onOpenChange(false);
    await onAssigned();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col overflow-hidden p-0 sm:max-w-md">
        <SheetHeader className="border-b border-[var(--nestora-sage-muted)] p-5 text-left">
          <SheetTitle className="text-lg text-[var(--nestora-forest)]">Assign student</SheetTitle>
          <SheetDescription>
            {room
              ? `Place an unallocated student in ${room.roomNumber} · ${room.hostel}`
              : 'Select a room first.'}
          </SheetDescription>
        </SheetHeader>

        {loadingOptions ? (
          <div className="flex flex-1 items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-[var(--nestora-sage)]" aria-hidden />
            Loading beds and eligible students…
          </div>
        ) : (
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
            {availableBeds.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[var(--nestora-gold)] bg-[color-mix(in_oklch,var(--nestora-gold)_10%,var(--card))] p-3 text-xs text-[var(--nestora-forest)]">
                No available beds in this room. Free a bed or pick another room.
              </p>
            ) : null}

            <label className="block space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Student</span>
              <select
                value={studentUserId}
                onChange={(e) => setStudentUserId(e.target.value)}
                className={cn('h-10 w-full rounded-xl border border-input bg-background px-3 text-sm', focusRing)}
              >
                <option value="">Select unallocated student</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.studentId} · {s.name}
                  </option>
                ))}
              </select>
              {students.length === 0 ? (
                <span className="text-[11px] text-muted-foreground">No active unallocated students in directory.</span>
              ) : null}
            </label>

            <label className="block space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Bed</span>
              <select
                value={bedId}
                onChange={(e) => setBedId(e.target.value)}
                className={cn('h-10 w-full rounded-xl border border-input bg-background px-3 text-sm', focusRing)}
              >
                <option value="">Select open bed</option>
                {availableBeds.map((b) => (
                  <option key={b.id} value={b.id}>
                    Bed {b.bedNumber}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Effective from</span>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-10 rounded-xl"
              />
            </label>
          </div>
        )}

        <SheetFooter className="flex-row justify-end gap-2 border-t border-[var(--nestora-sage-muted)] p-5">
          <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-xl bg-[var(--nestora-forest)] text-white hover:brightness-110"
            disabled={!canSave}
            onClick={() => void save()}
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Assigning…
              </>
            ) : (
              'Assign to room'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
