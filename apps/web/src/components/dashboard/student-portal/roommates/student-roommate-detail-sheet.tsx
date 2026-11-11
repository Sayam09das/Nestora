'use client';

import { BedDouble, Building2, GraduationCap, Hash, Shield } from 'lucide-react';

import type { StudentRoommateDetail } from '@/components/dashboard/student-portal/roommates/student-roommates-data';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roommate: StudentRoommateDetail | null;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border py-3 last:border-0 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground sm:text-right">{value}</dd>
    </div>
  );
}

export function StudentRoommateDetailSheet({ open, onOpenChange, roommate }: Props) {
  if (!roommate) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-md">
        <SheetHeader className="border-b bg-[color-mix(in_oklch,var(--nestora-cream)_40%,var(--card))] p-6 text-left">
          <div className="flex items-center gap-4">
            <span
              className={cn(
                'flex size-16 shrink-0 items-center justify-center rounded-2xl text-lg font-bold shadow-sm',
                roommate.isYou
                  ? 'bg-[var(--nestora-forest)] text-white'
                  : 'bg-[color-mix(in_oklch,var(--nestora-sage)_25%,var(--muted))] text-[var(--nestora-forest)]',
              )}
              aria-hidden
            >
              {roommate.initials}
            </span>
            <div className="min-w-0">
              <SheetTitle className="text-lg text-[var(--nestora-forest)]">{roommate.name}</SheetTitle>
              <SheetDescription className="mt-1 font-mono text-xs">
                {roommate.registrationNumber}
                {roommate.isYou ? ' · You' : ' · Roommate'}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 p-6">
          <section aria-labelledby="roommate-academic-heading">
            <h3
              id="roommate-academic-heading"
              className="flex items-center gap-2 text-sm font-semibold text-[var(--nestora-forest)]"
            >
              <GraduationCap className="size-4 text-[var(--nestora-sage)]" aria-hidden />
              Academic record
            </h3>
            <dl className="mt-2 rounded-xl border border-border bg-card px-4">
              <DetailRow label="Department" value={roommate.department} />
              <DetailRow label="Course" value={roommate.course} />
              <DetailRow label="Academic year" value={roommate.academicYear} />
              <DetailRow label="Admission year" value={roommate.admissionYear} />
            </dl>
          </section>

          <section aria-labelledby="roommate-bed-heading">
            <h3
              id="roommate-bed-heading"
              className="flex items-center gap-2 text-sm font-semibold text-[var(--nestora-forest)]"
            >
              <BedDouble className="size-4 text-[var(--nestora-sage)]" aria-hidden />
              Bed assignment
            </h3>
            <dl className="mt-2 rounded-xl border border-border bg-card px-4">
              <DetailRow label="Assigned bed" value={roommate.bedLabel} />
            </dl>
          </section>

          <section aria-labelledby="roommate-hostel-heading">
            <h3
              id="roommate-hostel-heading"
              className="flex items-center gap-2 text-sm font-semibold text-[var(--nestora-forest)]"
            >
              <Building2 className="size-4 text-[var(--nestora-sage)]" aria-hidden />
              Hostel &amp; room
            </h3>
            <dl className="mt-2 rounded-xl border border-border bg-card px-4">
              <DetailRow label="Hostel" value={roommate.hostelName} />
              <DetailRow label="Block" value={roommate.blockName} />
              <DetailRow label="Floor" value={roommate.floorLabel} />
              <DetailRow label="Room number" value={roommate.roomNumber} />
            </dl>
          </section>

          <p className="flex items-start gap-2 rounded-lg border border-[color-mix(in_oklch,var(--nestora-sage)_20%,var(--border))] bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
            <Shield className="mt-0.5 size-3.5 shrink-0 text-[var(--nestora-sage)]" aria-hidden />
            Only information permitted by your institution&apos;s privacy policy is shown here. Contact
            details, photos, and social profiles are not shared between residents.
          </p>
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
            <Hash className="size-3" aria-hidden />
            Profile avatars use initials — official photos are not displayed in the student portal.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
