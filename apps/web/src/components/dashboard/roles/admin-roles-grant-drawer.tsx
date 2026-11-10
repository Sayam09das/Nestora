'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { SAMPLE_ROLES } from '@/components/dashboard/roles/admin-roles-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

const HOSTELS = ['University-wide', 'Boys Hostel A', 'Girls Hostel B', 'Graduate Block C'] as const;

type Props = { open: boolean; onOpenChange: (o: boolean) => void; preselectId?: string };

export function AdminRolesGrantDrawer({ open, onOpenChange, preselectId }: Props) {
  const [roleId, setRoleId] = useState('');
  const [email, setEmail] = useState('');
  const [hostel, setHostel] = useState<(typeof HOSTELS)[number]>('University-wide');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!open) {
      setRoleId('');
      setEmail('');
      setHostel('University-wide');
      setNote('');
      return;
    }
    if (preselectId) setRoleId(preselectId);
  }, [open, preselectId]);

  const grant = () => {
    if (!roleId) {
      toast.error('Select a role.');
      return;
    }
    if (!email.trim()) {
      toast.error('User email is required.');
      return;
    }
    const role = SAMPLE_ROLES.find((r) => r.id === roleId);
    if (role?.scope === 'Hostel-scoped' && hostel === 'University-wide') {
      toast.error('Hostel-scoped roles require a hostel assignment (FR-006).');
      return;
    }
    toast.success(`Role grant queued for ${email} (sample · FR-140 audit).`);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-md">
        <SheetHeader className="border-b p-5 text-left">
          <SheetTitle className="text-lg text-[var(--nestora-forest)]">Grant role</SheetTitle>
          <SheetDescription>Provision or modify role assignment. Deactivation blocks login immediately (FR-007).</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 p-5">
          <label className="block space-y-1">
            <span className="text-xs font-medium">Role</span>
            <select value={roleId} onChange={(e) => setRoleId(e.target.value)} className={cn('h-10 w-full rounded-xl border px-3 text-sm', focusRing)}>
              <option value="">Select role</option>
              {SAMPLE_ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.code} · {r.title}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium">User email</span>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@university.edu"
              className={cn('rounded-xl', focusRing)}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium">Hostel scope</span>
            <select
              value={hostel}
              onChange={(e) => setHostel(e.target.value as (typeof HOSTELS)[number])}
              className={cn('h-10 w-full rounded-xl border px-3 text-sm', focusRing)}
            >
              {HOSTELS.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium">Audit note</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className={cn('w-full rounded-xl border px-3 py-2 text-sm', focusRing)}
              placeholder="Reason for grant or change…"
            />
          </label>
        </div>
        <SheetFooter className="border-t p-5 sm:flex-col sm:space-x-0">
          <Button type="button" className={cn('w-full rounded-xl bg-[var(--nestora-forest)] text-white', focusRing)} onClick={grant}>
            Confirm grant
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
