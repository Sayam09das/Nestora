'use client';

import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { AdminRoomsDetailPage } from '@/components/dashboard/rooms/admin-rooms-detail-page';
import type { RoomRecord } from '@/components/dashboard/rooms/admin-rooms-data';
import { Button } from '@/components/ui/button';
import { fetchRoomDirectoryById } from '@/lib/api/rooms';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type AdminRoomDetailPageProps = {
  roomId: string;
};

export function AdminRoomDetailPage({ roomId }: AdminRoomDetailPageProps) {
  const searchParams = useSearchParams();
  const autoOpenEdit = searchParams.get('edit') === '1';
  const [room, setRoom] = useState<RoomRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const result = await fetchRoomDirectoryById(roomId);
    if (result.room) {
      setRoom(result.room);
    } else {
      setRoom(null);
      setError(result.error ?? 'Room not found.');
    }
    setLoading(false);
  }, [roomId]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-[var(--nestora-sage)]" aria-hidden />
        Loading room details…
      </div>
    );
  }

  if (!room) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-12 text-center">
        <p className="text-sm text-destructive">{error ?? 'This room could not be found.'}</p>
        <Button
          nativeButton={false}
          variant="outline"
          className="rounded-xl"
          render={<Link href="/admin/rooms" className={focusRing} />}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to all rooms
        </Button>
      </div>
    );
  }

  return (
    <AdminRoomsDetailPage
      room={room}
      autoOpenEdit={autoOpenEdit}
      onRoomUpdated={load}
    />
  );
}
