'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { registerVisitor } from '@/lib/api/visitors';
import { fetchStudentDirectoryList } from '@/lib/api/students';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hostel: string;
  onRegistered: () => void;
};

export function WardenVisitorsRegisterSheet({ open, onOpenChange, hostel, onRegistered }: Props) {
  const [residentQuery, setResidentQuery] = useState('');
  const [residentStudentId, setResidentStudentId] = useState('');
  const [residentLabel, setResidentLabel] = useState('');
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [idProofType, setIdProofType] = useState('Aadhaar');
  const [idProofNumber, setIdProofNumber] = useState('');
  const [purpose, setPurpose] = useState('');
  const [saving, setSaving] = useState(false);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    if (!open) {
      setResidentQuery('');
      setResidentStudentId('');
      setResidentLabel('');
      setVisitorName('');
      setVisitorPhone('');
      setIdProofNumber('');
      setPurpose('');
    }
  }, [open]);

  const resolveResident = async () => {
    const q = residentQuery.trim();
    if (!q) {
      toast.message('Enter a registration number or resident name.');
      return;
    }
    setResolving(true);
    const result = await fetchStudentDirectoryList({
      page: 1,
      limit: 5,
      q,
      hostel: hostel === 'All Hostels' ? undefined : hostel,
      status: 'Active',
    });
    setResolving(false);
    const match = result.students?.[0];
    if (!match) {
      toast.error('No active resident found for that search.');
      return;
    }
    setResidentStudentId(match.id);
    setResidentLabel(`${match.name} · ${match.studentId} · ${match.room}`);
  };

  const submit = async () => {
    if (!residentStudentId) {
      toast.error('Link a resident before registering the visitor.');
      return;
    }
    setSaving(true);
    const result = await registerVisitor({
      studentId: residentStudentId,
      visitorName,
      visitorPhone,
      idProofType,
      idProofNumber,
      purpose,
    });
    setSaving(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success('Visitor registered for warden approval.');
    onRegistered();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-md">
        <SheetHeader className="border-b p-5 text-left">
          <SheetTitle className="text-lg text-[var(--nestora-forest)]">Register visitor</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 p-5">
          <label className="block space-y-1">
            <span className="text-xs font-medium">Resident (search)</span>
            <div className="flex gap-2">
              <Input
                value={residentQuery}
                onChange={(e) => setResidentQuery(e.target.value)}
                placeholder="Registration no. or name"
                className={cn('rounded-xl', focusRing)}
              />
              <Button type="button" variant="outline" className="shrink-0 rounded-xl" onClick={() => void resolveResident()}>
                {resolving ? <Loader2 className="size-4 animate-spin" /> : 'Find'}
              </Button>
            </div>
            {residentLabel ? <p className="text-xs text-muted-foreground">{residentLabel}</p> : null}
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium">Visitor name</span>
            <Input value={visitorName} onChange={(e) => setVisitorName(e.target.value)} className={cn('rounded-xl', focusRing)} />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium">Phone</span>
            <Input value={visitorPhone} onChange={(e) => setVisitorPhone(e.target.value)} className={cn('rounded-xl', focusRing)} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1">
              <span className="text-xs font-medium">ID proof</span>
              <Input value={idProofType} onChange={(e) => setIdProofType(e.target.value)} className={cn('rounded-xl', focusRing)} />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium">ID number</span>
              <Input value={idProofNumber} onChange={(e) => setIdProofNumber(e.target.value)} className={cn('rounded-xl', focusRing)} />
            </label>
          </div>
          <label className="block space-y-1">
            <span className="text-xs font-medium">Purpose of visit</span>
            <Textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} rows={3} className={cn('rounded-xl', focusRing)} />
          </label>
        </div>
        <SheetFooter className="border-t p-5">
          <Button
            type="button"
            className="w-full rounded-xl bg-[var(--nestora-forest)] text-white"
            disabled={saving}
            onClick={() => void submit()}
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : 'Submit for approval'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
