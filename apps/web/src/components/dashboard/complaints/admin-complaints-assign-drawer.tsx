'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  CATEGORY_META,
  type ComplaintPriority,
  type ComplaintTicket,
} from '@/components/dashboard/complaints/admin-complaints-data';
import { assignComplaintTicket } from '@/lib/api/complaints';
import { fetchStaffDirectoryList } from '@/lib/api/staff';
import type { StaffRecord } from '@/components/dashboard/staff/admin-staff-data';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

const PRIORITIES: ComplaintPriority[] = ['Low', 'Medium', 'High', 'Critical'];

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onAssigned?: (ticket: ComplaintTicket) => void;
  preselectTicketId?: string;
  tickets: ComplaintTicket[];
};

export function AdminComplaintsAssignDrawer({
  open,
  onOpenChange,
  onAssigned,
  preselectTicketId,
  tickets,
}: Props) {
  const [ticketId, setTicketId] = useState('');
  const [staffUserId, setStaffUserId] = useState('');
  const [priority, setPriority] = useState<ComplaintPriority>('Medium');
  const [staffPool, setStaffPool] = useState<StaffRecord[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [saving, setSaving] = useState(false);

  const openTickets = useMemo(
    () => tickets.filter((t) => t.status !== 'Resolved' && t.status !== 'Rejected'),
    [tickets],
  );

  const ticket = openTickets.find((t) => t.id === ticketId);

  useEffect(() => {
    if (!open) {
      setTicketId('');
      setStaffUserId('');
      setPriority('Medium');
      return;
    }
    if (preselectTicketId) setTicketId(preselectTicketId);
  }, [open, preselectTicketId]);

  useEffect(() => {
    if (!ticket) {
      setStaffUserId('');
      return;
    }
    setPriority(ticket.finalPriority ?? ticket.suggestedPriority);
  }, [ticket]);

  useEffect(() => {
    if (!open || !ticket) {
      setStaffPool([]);
      return;
    }
    let cancelled = false;
    setLoadingStaff(true);
    void (async () => {
      const result = await fetchStaffDirectoryList({ page: 1, limit: 100, status: 'Active' });
      if (cancelled) return;
      const deptHint = CATEGORY_META[ticket.category].department.toLowerCase();
      const staff =
        result.staff?.filter((s) => {
          const dept = s.department.toLowerCase();
          return dept.includes(deptHint) || dept.includes('maintenance') || dept.includes('housekeeping');
        }) ?? [];
      setStaffPool(staff.length ? staff : (result.staff ?? []));
      setLoadingStaff(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, ticket]);

  const save = async () => {
    if (!ticket || !staffUserId) {
      toast.error('Select a ticket and staff member (FR-067).');
      return;
    }
    setSaving(true);
    const result = await assignComplaintTicket({
      ticketId: ticket.id,
      staffUserId,
      priority,
    });
    setSaving(false);
    if (result.ticket) {
      onAssigned?.(result.ticket);
      toast.success(`${ticket.ticketNumber} assigned with ${priority} priority.`);
      onOpenChange(false);
      return;
    }
    toast.error(result.error ?? 'Assignment failed.');
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
          {openTickets.length === 0 ? (
            <p className="text-xs text-muted-foreground">No open tickets. Run `pnpm neon:seed-complaints` if the board is empty.</p>
          ) : null}
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
              value={staffUserId}
              onChange={(e) => setStaffUserId(e.target.value)}
              disabled={!ticket || loadingStaff}
              className={cn('h-10 w-full rounded-xl border px-3 text-sm disabled:opacity-50', focusRing)}
            >
              <option value="">{loadingStaff ? 'Loading staff…' : 'Select staff'}</option>
              {staffPool.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.department}
                </option>
              ))}
            </select>
          </label>
        </div>
        <SheetFooter className="border-t p-5 sm:justify-between">
          <Button type="button" variant="outline" className={cn('rounded-xl', focusRing)} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={saving || !ticket}
            className={cn('rounded-xl bg-[var(--nestora-forest)] text-white', focusRing)}
            onClick={() => void save()}
          >
            {saving ? 'Saving…' : 'Confirm assignment'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
