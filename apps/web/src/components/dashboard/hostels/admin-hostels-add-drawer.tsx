'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  HOSTEL_FACILITY_OPTIONS,
  SAMPLE_HOSTELS,
  WARDEN_ASSIGN_OPTIONS,
  generateHostelCode,
  type HostelGenderCategory,
} from '@/components/dashboard/hostels/admin-hostels-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

const GENDER_OPTIONS: HostelGenderCategory[] = ["Boys' Hostel", "Girls' Hostel"];

type Props = { open: boolean; onOpenChange: (o: boolean) => void };

export function AdminHostelsAddDrawer({ open, onOpenChange }: Props) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<HostelGenderCategory>("Boys' Hostel");
  const [campusZone, setCampusZone] = useState('North Campus');
  const [address, setAddress] = useState('');
  const [bedCapacity, setBedCapacity] = useState('');
  const [warden, setWarden] = useState('Unassigned');
  const [phone, setPhone] = useState('');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [description, setDescription] = useState('');
  const [facilities, setFacilities] = useState<string[]>([]);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!open) {
      setName('');
      setGender("Boys' Hostel");
      setCampusZone('North Campus');
      setAddress('');
      setBedCapacity('');
      setWarden('Unassigned');
      setPhone('');
      setYear(String(new Date().getFullYear()));
      setDescription('');
      setFacilities([]);
      setActive(true);
    }
  }, [open]);

  const hostelCode = useMemo(() => generateHostelCode(SAMPLE_HOSTELS.length + 1), []);

  const toggleFacility = (f: string) => {
    setFacilities((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  };

  const beds = Number(bedCapacity);
  const valid = name.trim() && address.trim() && beds > 0;

  const save = () => {
    if (!valid) {
      toast.error('Fill required fields; bed capacity must be greater than zero.');
      return;
    }
    toast.success(`${hostelCode} · ${name} saved (sample UI). Child buildings inherit ${gender}.`);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-md">
        <SheetHeader className="border-b p-5 text-left">
          <SheetTitle className="text-lg text-[var(--nestora-forest)]">Add hostel</SheetTitle>
          <SheetDescription>
            Each hostel must use Boys or Girls classification. Under-setup hostels cannot receive new room assignments.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 p-5">
          <label className="block space-y-1">
            <span className="text-xs font-medium">
              Hostel name <span className="text-destructive">*</span>
            </span>
            <Input value={name} onChange={(e) => setName(e.target.value)} className={cn('h-10 rounded-xl', focusRing)} />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium">Hostel code</span>
            <Input readOnly value={hostelCode} className="h-10 rounded-xl bg-muted/40 font-mono text-sm" />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium">
              Gender category <span className="text-destructive">*</span>
            </span>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as HostelGenderCategory)}
              className={cn('h-10 w-full rounded-xl border px-3 text-sm', focusRing)}
            >
              {GENDER_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium">Campus zone</span>
            <Input value={campusZone} onChange={(e) => setCampusZone(e.target.value)} className={cn('h-10 rounded-xl', focusRing)} />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium">
              Address <span className="text-destructive">*</span>
            </span>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} className={cn('h-10 rounded-xl', focusRing)} />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium">
              Planned bed capacity <span className="text-destructive">*</span>
            </span>
            <Input
              type="number"
              min={1}
              value={bedCapacity}
              onChange={(e) => setBedCapacity(e.target.value)}
              className={cn('h-10 rounded-xl', focusRing)}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium">Assigned warden</span>
            <select
              value={warden}
              onChange={(e) => setWarden(e.target.value)}
              className={cn('h-10 w-full rounded-xl border px-3 text-sm', focusRing)}
            >
              {WARDEN_ASSIGN_OPTIONS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium">Contact phone</span>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} className={cn('h-10 rounded-xl', focusRing)} />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium">Year established</span>
            <Input type="number" value={year} onChange={(e) => setYear(e.target.value)} className={cn('h-10 rounded-xl', focusRing)} />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={cn('w-full rounded-xl border border-input bg-background px-3 py-2 text-sm', focusRing)}
            />
          </label>
          <fieldset className="space-y-2">
            <legend className="text-xs font-medium">Facilities</legend>
            <div className="flex flex-wrap gap-2">
              {HOSTEL_FACILITY_OPTIONS.map((f) => {
                const on = facilities.includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleFacility(f)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                      on
                        ? 'border-[var(--nestora-forest)] bg-[color-mix(in_oklch,var(--nestora-sage-light)_40%,var(--card))] text-[var(--nestora-forest)]'
                        : 'border-border text-muted-foreground hover:border-[var(--nestora-sage-muted)]',
                      focusRing,
                    )}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <label className="block space-y-1">
            <span className="text-xs font-medium">Hostel image</span>
            <Input type="file" accept="image/*" className={cn('h-10 rounded-xl text-xs', focusRing)} />
          </label>
          <div className="flex items-center justify-between rounded-xl border px-3 py-2">
            <span>
              <span className="text-xs font-medium text-foreground">Status</span>
              <p className="text-[11px] text-muted-foreground">
                {active ? 'Active — available for new rooms' : 'Under setup — no new room assignments'}
              </p>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={active}
              onClick={() => setActive((v) => !v)}
              className={cn(
                'relative h-7 w-12 rounded-full border transition-colors',
                active ? 'border-[var(--nestora-sage)] bg-[var(--nestora-forest)]' : 'border-border bg-muted',
                focusRing,
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform',
                  active ? 'left-6' : 'left-0.5',
                )}
              />
            </button>
          </div>
        </div>
        <SheetFooter className="flex-row gap-2 border-t p-5">
          <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" className="rounded-xl bg-[var(--nestora-forest)] text-white" onClick={save} disabled={!valid}>
            Save hostel
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
