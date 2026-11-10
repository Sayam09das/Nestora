'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  SAMPLE_COMPLAINTS,
  STAFF_BY_CATEGORY,
  type ComplaintPriority,
  type ComplaintTicket,
} from '@/components/dashboard/complaints/admin-complaints-data';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

const PRIORITIES: ComplaintPriority[] = ['Low', 'Medium', 'High', 'Critical'];

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onAssigned?: (ticketId: string, staffName: string, priority: ComplaintPriority) => void;
  preselectTicketId?: string;
};

export function AdminComplaintsAssignDrawer({ open, onOpenChange, onAssigned, preselectTicketId }: Props) {
  const [ticketId, setTicketId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [priority, setPriority] = useState<ComplaintPriority>('Medium');

  const openTickets = useMemo(
    () => SAMPLE_COMPLAINTS.filter((t) => t.status !== 'Resolved' && t.status !== 'Rejected'),
    [],
  );

  const ticket = openTickets.find((t) => t.id === ticketId);

  useEffect(() => {
    if (!open) {
      setTicketId('');
      setStaffId('');
      setPriority('Medium');
      return;
    }
    if (preselectTicketId) setTicketId(preselectTicketId);
  }, [open, preselectTicketId]);

  useEffect(() => {
    if (!ticket) {
      setStaffId('');
      return;
    }
    setPriority(ticket.finalPriority ?? ticket.suggestedPriority);
    const suggested = STAFF_BY_CATEGORY[ticket.category][0];
    setStaffId(suggested?.id ?? '');
  }, [ticket]);

  const staffOptions = ticket ? STAFF_BY_CATEGORY[ticket.category] : [];

  const save = () => {
    if (!ticket || !staffId) {
      toast.error('Select a ticket and staff member (FR-067).');
      return;
    }
    const staff = staffOptions.find((s) => s.id === staffId);
    if (!staff) return;
    onAssigned?.(ticket.id, staff.name, priority);
    toast.success(`${ticket.ticketNumber} → ${staff.name} · ${priority} priority (sample).`);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-md">
        <SheetHeader className="border-b p-5 text-left">
          <SheetTitle className="text-lg text-[var(--nestora-forest)]">Assign maintenance ticket</SheetTitle>
          <SheetDescription>
            Warden sets final priority. Staff list is filtered by category (FR-068).
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 p-5">
          <label className="block space-y-1">
            <span className="text-xs font-medium">Open ticket</span>
            <select
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              className={cn('h-10 w-full rounded-xl border px-3 text-sm', focusRing)}
            >
              <option value="">Select ticket</option>
              {openTickets.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.ticketNumber} · {t.title}
                </option>
              ))}
            </select>
          </label>
          {ticket ? (
            <div className="rounded-xl border border-[color-mix(in_oklch,var(--nestora-sage)_20%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--card))] p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">{ticket.category}</p>
              <p className="mt-1">{ticket.location}</p>
              <p className="mt-1">
                Student suggested{' '}
                <span className="font-semibold text-foreground">{ticket.suggestedPriority}</span>
              </p>
            </div>
          ) : null}
          <label className="block space-y-1">
            <span className="text-xs font-medium">Final priority (warden)</span>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
              className={cn('h-10 w-full rounded-xl border px-3 text-sm', focusRing)}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium">Assign to staff</span>
            <select
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              disabled={!ticket}
              className={cn('h-10 w-full rounded-xl border px-3 text-sm disabled:opacity-50', focusRing)}
            >
              <option value="">Select staff</option>
              {staffOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.shift}
                </option>
              ))}
            </select>
          </label>
        </div>
        <SheetFooter className="border-t p-5 sm:justify-between">
          <Button type="button" variant="outline" className={cn('rounded-xl', focusRing)} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" className={cn('rounded-xl bg-[var(--nestora-forest)] text-white', focusRing)} onClick={save}>
            Confirm assignment
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
