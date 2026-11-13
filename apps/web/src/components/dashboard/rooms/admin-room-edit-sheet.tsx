'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import type { RoomOperationalStatus, RoomRecord } from '@/components/dashboard/rooms/admin-rooms-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { type RoomInfrastructureStatus, patchInfrastructureRoom } from '@/lib/api/rooms';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

const STATUS_OPTIONS: { value: RoomInfrastructureStatus; label: string; hint: string }[] = [
  { value: 'ACTIVE', label: 'Active', hint: 'Room is in regular operation' },
  { value: 'UNDER_MAINTENANCE', label: 'Under maintenance', hint: 'Temporarily unavailable for allocation' },
  { value: 'DECOMMISSIONED', label: 'Decommissioned', hint: 'Inactive / removed from assignment pool' },
];

function operationalToInfrastructureStatus(status: RoomOperationalStatus): RoomInfrastructureStatus {
  if (status === 'Maintenance') return 'UNDER_MAINTENANCE';
  if (status === 'Inactive') return 'DECOMMISSIONED';
  return 'ACTIVE';
}

type AdminRoomEditSheetProps = {
  room: RoomRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void | Promise<void>;
};

export function AdminRoomEditSheet({ room, open, onOpenChange, onSaved }: AdminRoomEditSheetProps) {
  const [roomNumber, setRoomNumber] = useState(room.roomNumber);
  const [status, setStatus] = useState<RoomInfrastructureStatus>(operationalToInfrastructureStatus(room.operationalStatus));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setRoomNumber(room.roomNumber);
    setStatus(operationalToInfrastructureStatus(room.operationalStatus));
  }, [open, room.roomNumber, room.operationalStatus]);

  const trimmed = roomNumber.trim();
  const unchanged = trimmed === room.roomNumber && status === operationalToInfrastructureStatus(room.operationalStatus);
  const canSave = trimmed.length > 0 && trimmed.length <= 20 && !unchanged && !saving;

  const save = async () => {
    if (!canSave) {
      if (unchanged) {
        toast.message('No changes to save.');
      }
      return;
    }
    setSaving(true);
    const body: { roomNumber?: string; status?: RoomInfrastructureStatus } = {};
    if (trimmed !== room.roomNumber) {
      body.roomNumber = trimmed;
    }
    const previousStatus = operationalToInfrastructureStatus(room.operationalStatus);
    if (status !== previousStatus) {
      body.status = status;
    }
    const result = await patchInfrastructureRoom(room.id, body);
    setSaving(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`Room ${trimmed} updated.`);
    onOpenChange(false);
    await onSaved();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col overflow-hidden p-0 sm:max-w-md">
        <SheetHeader className="border-b border-[var(--nestora-sage-muted)] p-5 text-left">
          <SheetTitle className="text-lg text-[var(--nestora-forest)]">Edit room</SheetTitle>
          <SheetDescription>
            Update room number or operational status for {room.hostel} · {room.block}.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          <label className="block space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Room number</span>
            <Input
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              maxLength={20}
              className="h-10 rounded-xl"
              autoComplete="off"
            />
            <span className="text-[11px] text-muted-foreground">Shown in directory as {room.roomId.replace(/^RM-/, 'RM-')}</span>
          </label>

          <label className="block space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Room status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as RoomInfrastructureStatus)}
              className={cn(
                'h-10 w-full rounded-xl border border-input bg-background px-3 text-sm',
                focusRing,
              )}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-muted-foreground">
              {STATUS_OPTIONS.find((o) => o.value === status)?.hint}
            </span>
          </label>

          <fieldset className="rounded-xl border border-dashed border-[var(--nestora-sage-muted)] bg-[color-mix(in_oklch,var(--nestora-cream)_15%,var(--card))] p-3 text-xs text-muted-foreground">
            <legend className="px-1 text-[10px] font-bold uppercase tracking-wide text-[var(--nestora-sage)]">
              Read-only
            </legend>
            <ul className="mt-1 space-y-1">
              <li>
                <span className="font-medium text-foreground">Sharing:</span> {room.roomType} ({room.capacity} beds)
              </li>
              <li>
                <span className="font-medium text-foreground">Location:</span> {room.floor}
              </li>
              <li>
                <span className="font-medium text-foreground">Occupancy:</span> {room.occupiedBeds}/{room.capacity} beds (
                {room.operationalStatus})
              </li>
            </ul>
          </fieldset>
        </div>

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
                Saving…
              </>
            ) : (
              'Save changes'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
