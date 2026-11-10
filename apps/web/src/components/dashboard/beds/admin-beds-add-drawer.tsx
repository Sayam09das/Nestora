'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  BED_STATUS_OPTIONS,
  BED_TYPE_OPTIONS,
  ROOM_PICKER_OPTIONS,
  generateBedId,
  type BedStatus,
  type BedType,
} from '@/components/dashboard/beds/admin-beds-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type AdminBedsAddDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type AddBedForm = {
  hostel: string;
  block: string;
  floor: string;
  roomNumber: string;
  bedNumber: string;
  bedType: BedType;
  status: BedStatus;
  description: string;
};

const emptyForm = (): AddBedForm => ({
  hostel: '',
  block: '',
  floor: '',
  roomNumber: '',
  bedNumber: '01',
  bedType: 'Single Bed',
  status: 'Available',
  description: '',
});

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
      {children}
      {required ? <span className="text-destructive"> *</span> : null}
    </span>
  );
}

export function AdminBedsAddDrawer({ open, onOpenChange }: AdminBedsAddDrawerProps) {
  const reduceMotion = useReducedMotion();
  const [form, setForm] = useState<AddBedForm>(emptyForm);

  useEffect(() => {
    if (!open) {
      setForm(emptyForm());
    }
  }, [open]);

  const bedIdPreview = useMemo(() => {
    if (!form.roomNumber) return 'Auto-generated after room is selected';
    return generateBedId(form.roomNumber, form.bedNumber);
  }, [form.roomNumber, form.bedNumber]);

  const onRoomPick = (roomNumber: string) => {
    const room = ROOM_PICKER_OPTIONS.find((r) => r.roomNumber === roomNumber);
    if (!room) return;
    setForm((f) => ({
      ...f,
      roomNumber: room.roomNumber,
      hostel: room.hostel,
      block: room.block,
      floor: room.floor,
    }));
  };

  const valid =
    form.hostel && form.block && form.floor && form.roomNumber && form.bedNumber && form.bedType && form.status;

  const submit = () => {
    if (!valid) {
      toast.error('Complete all required fields before saving.');
      return;
    }
    if (form.status === 'Occupied') {
      toast.error('New beds cannot be created as Occupied — assign a student after creation.');
      return;
    }
    toast.success(`Bed ${bedIdPreview} registered (sample UI).`);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto border-[var(--nestora-sage-muted)] p-0 sm:max-w-md">
        <SheetHeader className="border-b border-[var(--nestora-sage-muted)]/70 bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--card))] p-5 text-left">
          <SheetTitle className="text-lg font-semibold text-[var(--nestora-forest)]">Add bed</SheetTitle>
          <SheetDescription className="text-sm">
            Every bed must belong to one room. Beds under maintenance or in rooms under maintenance cannot be allocated.
          </SheetDescription>
        </SheetHeader>

        <motion.div
          initial={reduceMotion || !open ? false : { opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-4 p-5"
        >
          <label className="flex flex-col gap-1.5">
            <FieldLabel required>Bed ID</FieldLabel>
            <Input readOnly value={bedIdPreview} className="h-10 rounded-xl bg-muted/40 font-mono text-sm" />
          </label>

          <label className="flex flex-col gap-1.5">
            <FieldLabel required>Room number</FieldLabel>
            <select
              value={form.roomNumber}
              onChange={(e) => onRoomPick(e.target.value)}
              className={cn('h-10 rounded-xl border border-[var(--nestora-sage-muted)] bg-card px-3 text-sm', focusRing)}
            >
              <option value="">Select room</option>
              {ROOM_PICKER_OPTIONS.map((r) => (
                <option key={r.roomNumber} value={r.roomNumber}>
                  {r.roomNumber} · {r.hostel}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <FieldLabel required>Hostel</FieldLabel>
              <Input readOnly value={form.hostel || '—'} className="h-10 rounded-xl bg-muted/30" />
            </label>
            <label className="flex flex-col gap-1.5">
              <FieldLabel required>Block</FieldLabel>
              <Input readOnly value={form.block || '—'} className="h-10 rounded-xl bg-muted/30" />
            </label>
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <FieldLabel required>Floor</FieldLabel>
              <Input readOnly value={form.floor || '—'} className="h-10 rounded-xl bg-muted/30" />
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <FieldLabel required>Bed number</FieldLabel>
            <Input
              value={form.bedNumber}
              onChange={(e) => setForm((f) => ({ ...f, bedNumber: e.target.value }))}
              placeholder="01"
              className="h-10 rounded-xl"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <FieldLabel required>Bed type</FieldLabel>
            <select
              value={form.bedType}
              onChange={(e) => setForm((f) => ({ ...f, bedType: e.target.value as BedType }))}
              className={cn('h-10 rounded-xl border border-[var(--nestora-sage-muted)] bg-card px-3 text-sm', focusRing)}
            >
              {BED_TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <FieldLabel required>Bed status</FieldLabel>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as BedStatus }))}
              className={cn('h-10 rounded-xl border border-[var(--nestora-sage-muted)] bg-card px-3 text-sm', focusRing)}
            >
              {BED_STATUS_OPTIONS.filter((s) => s !== 'Occupied').map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-muted-foreground">Occupied status is set only when a student is allocated.</p>
          </label>

          <label className="flex flex-col gap-1.5">
            <FieldLabel>Description</FieldLabel>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className={cn(
                'rounded-xl border border-[var(--nestora-sage-muted)] bg-card px-3 py-2 text-sm',
                focusRing,
              )}
              placeholder="Optional notes for housekeeping or maintenance…"
            />
          </label>
        </motion.div>

        <SheetFooter className="flex-row justify-end gap-2 border-t border-[var(--nestora-sage-muted)]/70 p-5">
          <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" className="rounded-xl bg-[var(--nestora-forest)] text-white" onClick={submit} disabled={!valid}>
            Save bed
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
