'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  BED_CONFIGURATION_OPTIONS,
  FACILITY_OPTIONS,
  ROOM_CATEGORY_OPTIONS,
  SAMPLE_ROOM_TYPES,
  generateTypeCode,
  type BedConfiguration,
  type RoomCategory,
} from '@/components/dashboard/room-types/admin-room-types-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = { open: boolean; onOpenChange: (o: boolean) => void };

export function AdminRoomTypesAddDrawer({ open, onOpenChange }: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<RoomCategory>('General');
  const [capacity, setCapacity] = useState('2');
  const [bedConfig, setBedConfig] = useState<BedConfiguration>('Single Bed');
  const [price, setPrice] = useState('');
  const [deposit, setDeposit] = useState('');
  const [description, setDescription] = useState('');
  const [facilities, setFacilities] = useState<string[]>([]);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!open) {
      setName('');
      setCategory('General');
      setCapacity('2');
      setBedConfig('Single Bed');
      setPrice('');
      setDeposit('');
      setDescription('');
      setFacilities([]);
      setActive(true);
    }
  }, [open]);

  const typeCode = useMemo(
    () => generateTypeCode(SAMPLE_ROOM_TYPES.length + 1),
    [],
  );

  const toggleFacility = (f: string) => {
    setFacilities((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  };

  const cap = Number(capacity);
  const valid = name.trim() && cap > 0 && Number(price) > 0;

  const save = () => {
    if (!valid) {
      toast.error('Fill required fields; capacity must be greater than zero.');
      return;
    }
    if (bedConfig === 'Single Bed' && cap > 4) {
      toast.warning('Verify bed configuration supports defined capacity.');
    }
    toast.success(`${typeCode} · ${name} saved (sample UI).`);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-md">
        <SheetHeader className="border-b p-5 text-left">
          <SheetTitle className="text-lg text-[var(--nestora-forest)]">Add room type</SheetTitle>
          <SheetDescription>Unique type codes; inactive types cannot attach to new rooms.</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 p-5">
          <label className="block space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Room type name *</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-10 rounded-xl" />
          </label>
          <label className="block space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Type code *</span>
            <Input readOnly value={typeCode} className="h-10 rounded-xl bg-muted/40 font-mono" />
          </label>
          <label className="block space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Room category *</span>
            <select value={category} onChange={(e) => setCategory(e.target.value as RoomCategory)} className={cn('h-10 w-full rounded-xl border px-3 text-sm', focusRing)}>
              {ROOM_CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Max capacity *</span>
              <Input type="number" min={1} value={capacity} onChange={(e) => setCapacity(e.target.value)} className="h-10 rounded-xl" />
            </label>
            <label className="block space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Monthly price *</span>
              <Input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} className="h-10 rounded-xl" placeholder="INR" />
            </label>
          </div>
          <label className="block space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Bed configuration *</span>
            <select value={bedConfig} onChange={(e) => setBedConfig(e.target.value as BedConfiguration)} className={cn('h-10 w-full rounded-xl border px-3 text-sm', focusRing)}>
              {BED_CONFIGURATION_OPTIONS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Security deposit</span>
            <Input type="number" value={deposit} onChange={(e) => setDeposit(e.target.value)} className="h-10 rounded-xl" />
          </label>
          <label className="block space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Description</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={cn('w-full rounded-xl border px-3 py-2 text-sm', focusRing)} />
          </label>
          <fieldset className="space-y-2">
            <legend className="text-[10px] font-bold uppercase text-muted-foreground">Facilities</legend>
            <ul className="flex flex-wrap gap-2">
              {FACILITY_OPTIONS.map((f) => {
                const on = facilities.includes(f);
                return (
                  <li key={f}>
                    <button
                      type="button"
                      onClick={() => toggleFacility(f)}
                      className={cn(
                        'rounded-full border px-2.5 py-1 text-xs font-medium',
                        on
                          ? 'border-[var(--nestora-sage)] bg-[color-mix(in_oklch,var(--nestora-sage-light)_45%,var(--card))] text-[var(--nestora-forest)]'
                          : 'border-[var(--nestora-sage-muted)] text-muted-foreground',
                        focusRing,
                      )}
                    >
                      {f}
                    </button>
                  </li>
                );
              })}
            </ul>
          </fieldset>
          <label className="flex items-center justify-between rounded-xl border border-[var(--nestora-sage-muted)] px-3 py-2">
            <span className="text-sm font-medium">Active status</span>
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="size-4 accent-[var(--nestora-forest)]" />
          </label>
          <label className="block space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Room image</span>
            <Input type="file" accept="image/jpeg,image/png,image/webp" className="rounded-xl text-sm" />
          </label>
        </div>
        <SheetFooter className="flex-row justify-end gap-2 border-t p-5">
          <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" className="rounded-xl bg-[var(--nestora-forest)] text-white" onClick={save} disabled={!valid}>
            Save room type
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
