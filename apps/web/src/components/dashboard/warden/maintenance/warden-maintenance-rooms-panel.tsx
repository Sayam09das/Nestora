'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

import type { RoomRecord } from '@/components/dashboard/rooms/admin-rooms-data';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  rooms: RoomRecord[];
  loading: boolean;
  hostelName: string;
};

export function WardenMaintenanceRoomsPanel({ rooms, loading, hostelName }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      data-cmp-reveal
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--nestora-sage)_18%,var(--border))] bg-card shadow-sm"
      aria-labelledby="warden-maint-rooms-heading"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[color-mix(in_oklch,var(--nestora-sage)_12%,var(--border))] px-4 py-3 sm:px-5">
        <div>
          <h2 id="warden-maint-rooms-heading" className="text-sm font-semibold text-[var(--nestora-forest)]">
            Rooms on maintenance hold
          </h2>
          <p className="text-xs text-muted-foreground">{hostelName} · offline from allocation</p>
        </div>
        <Link href="/warden/rooms" className={cn('text-xs font-semibold text-[var(--nestora-sage)] hover:text-[var(--nestora-forest)]', focusRing)}>
          Open rooms desk
        </Link>
      </div>
      {loading && rooms.length === 0 ? (
        <div className="flex min-h-[20vh] items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-[var(--nestora-sage)]" aria-hidden />
          Loading rooms…
        </div>
      ) : rooms.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-muted-foreground">No rooms are marked maintenance in this hostel.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[10px] font-bold uppercase tracking-wide">Room</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wide">Block</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wide">Type</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wide">Beds</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wide">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((room, i) => (
                <TableRow
                  key={room.id}
                  className="hover:bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--card))]"
                  style={reduceMotion ? undefined : { animationDelay: `${Math.min(i * 0.03, 0.3)}s` }}
                >
                  <TableCell className="font-medium text-[var(--nestora-forest)]">
                    <Link href={`/warden/rooms?room=${encodeURIComponent(room.roomNumber)}`} className={focusRing}>
                      {room.roomNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {room.block} · {room.floor}
                  </TableCell>
                  <TableCell className="text-xs">{room.roomType}</TableCell>
                  <TableCell className="text-xs tabular-nums text-muted-foreground">
                    {room.occupiedBeds}/{room.capacity}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
                      Maintenance
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </motion.section>
  );
}
