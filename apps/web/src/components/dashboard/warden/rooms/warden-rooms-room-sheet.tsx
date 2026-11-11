'use client';

import { BedDouble, Users } from 'lucide-react';

import { roomAvailableBeds, roomOccupancyPercent, type RoomRecord } from '@/components/dashboard/rooms/admin-rooms-data';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';

type Props = {
  room: RoomRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function WardenRoomsRoomSheet({ room, open, onOpenChange }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        {room ? (
          <>
            <SheetHeader>
              <SheetTitle className="text-[var(--nestora-forest)]">Room {room.roomNumber}</SheetTitle>
              <SheetDescription>
                {room.hostel} · {room.block} · {room.floor} · {room.roomType}
              </SheetDescription>
            </SheetHeader>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b py-2">
                <dt className="text-muted-foreground">Operational status</dt>
                <dd>
                  <Badge variant="outline" className="rounded-full">
                    {room.operationalStatus}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b py-2">
                <dt className="text-muted-foreground">Occupancy</dt>
                <dd className="font-semibold">
                  {room.occupiedBeds}/{room.capacity} ({roomOccupancyPercent(room)}%)
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b py-2">
                <dt className="text-muted-foreground">Open beds</dt>
                <dd className="font-semibold text-[var(--nestora-sage)]">{roomAvailableBeds(room)}</dd>
              </div>
              <div className="flex justify-between gap-4 py-2">
                <dt className="text-muted-foreground">Warden</dt>
                <dd>{room.wardenName}</dd>
              </div>
            </dl>
            <section className="mt-6">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--nestora-forest)]">
                <Users className="size-4" aria-hidden />
                Current residents
              </h3>
              {room.students.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">No residents assigned.</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {room.students.map((s) => (
                    <li key={s.id} className="flex items-center gap-2 rounded-lg border border-border/70 px-3 py-2 text-sm">
                      <BedDouble className="size-3.5 text-[var(--nestora-sage)]" aria-hidden />
                      <span className="font-medium">{s.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {s.studentId} · {s.bedLabel}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            {room.facilities.length > 0 ? (
              <section className="mt-6">
                <h3 className="text-sm font-semibold text-[var(--nestora-forest)]">Facilities</h3>
                <p className="mt-1 text-xs text-muted-foreground">{room.facilities.join(' · ')}</p>
              </section>
            ) : null}
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
