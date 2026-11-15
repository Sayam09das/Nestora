'use client';

import { Loader2, MapPin, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStudentOutingDesk } from '@/hooks/use-student-outing-desk';
import { submitStudentOutingApplication } from '@/lib/api/student-outings';

function todayIso(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
}

export function StudentOutingsPage() {
  const { desk, loading, error, mergeDesk } = useStudentOutingDesk();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [outingDate, setOutingDate] = useState(todayIso());
  const [departureTime, setDepartureTime] = useState('17:00');
  const [returnTime, setReturnTime] = useState('21:00');
  const [destination, setDestination] = useState('');
  const [isExceptional, setIsExceptional] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    const result = await submitStudentOutingApplication({
      outingDate,
      departureTime,
      expectedReturnTime: returnTime,
      destination,
      isExceptional,
    });
    setSubmitting(false);
    if (result.desk) {
      mergeDesk(result.desk);
      setOpen(false);
      toast.success('Outing request submitted.');
    } else {
      toast.error(result.error ?? 'Could not submit outing.');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--nestora-forest)]">Daily outings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Request same-day exit and return windows (MOD-08). {desk?.hostelName ? `Hostel: ${desk.hostelName}` : ''}
          </p>
        </div>
        <Button type="button" disabled={!desk?.canApply} onClick={() => setOpen(true)}>
          <Plus className="size-4" aria-hidden />
          New outing
        </Button>
      </header>

      {loading && !desk ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading…
        </p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {desk ? (
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['Pending', desk.summary.pending],
            ['Approved', desk.summary.approved],
            ['Rejected', desk.summary.rejected],
            ['Total', desk.summary.total],
          ].map(([label, value]) => (
            <div key={label as string} className="rounded-xl border bg-card p-3 text-center">
              <dt className="text-[10px] font-semibold uppercase text-muted-foreground">{label}</dt>
              <dd className="text-lg font-semibold text-[var(--nestora-forest)]">{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <ul className="space-y-3">
        {(desk?.requests ?? []).map((item) => (
          <li key={item.id} className="rounded-2xl border bg-card p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-foreground">
                {item.outingDate} · {item.departureTime}–{item.expectedReturnTime}
              </p>
              <span className="text-xs font-semibold uppercase text-muted-foreground">{item.statusLabel}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{item.statusNote}</p>
            <p className="mt-2 flex items-center gap-1.5 text-sm">
              <MapPin className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
              {item.destination}
              {item.isExceptional ? ' · Exceptional' : ''}
            </p>
          </li>
        ))}
        {!loading && (desk?.requests.length ?? 0) === 0 ? (
          <li className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No outing requests yet.
          </li>
        ) : null}
      </ul>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for outing</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="outing-date">Date</Label>
              <Input id="outing-date" type="date" value={outingDate} onChange={(e) => setOutingDate(e.target.value)} />
            </div>
            <div className="grid gap-1.5 sm:grid-cols-2">
              <div>
                <Label htmlFor="depart">Departure</Label>
                <Input id="depart" type="time" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="return">Expected return</Label>
                <Input id="return" type="time" value={returnTime} onChange={(e) => setReturnTime(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="dest">Destination</Label>
              <Input id="dest" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="City / locality" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={isExceptional} onCheckedChange={(v) => setIsExceptional(v === true)} />
              Exceptional outing (needs explicit warden approval)
            </label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={submitting || destination.trim().length < 2} onClick={() => void submit()}>
              {submitting ? 'Submitting…' : 'Submit request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}