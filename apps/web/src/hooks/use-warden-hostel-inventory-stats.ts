'use client';

import { useCallback, useEffect, useState } from 'react';

import { fetchBedDirectoryList } from '@/lib/api/beds';
import { fetchRoomDirectoryList } from '@/lib/api/rooms';

const LIVE_POLL_MS = 20_000;

export type WardenHostelInventoryStats = {
  totalRooms: number;
  availableBeds: number;
  occupiedBeds: number;
  maintenanceRooms: number;
};

function resolveHostelFilter(hostelApiFilter: string): string | undefined {
  const trimmed = hostelApiFilter.trim();
  if (!trimmed || trimmed === 'No hostel assigned') {
    return undefined;
  }
  return trimmed;
}

export function useWardenHostelInventoryStats(hostelApiFilter: string) {
  const [stats, setStats] = useState<WardenHostelInventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const hostel = resolveHostelFilter(hostelApiFilter);

  const load = useCallback(
    async (silent = false) => {
      if (!hostel) {
        setStats(null);
        setLoading(false);
        return;
      }
      if (!silent) {
        setLoading(true);
      }
      setError(null);
      const [roomsAll, bedsAvail, bedsOcc, roomsMaint] = await Promise.all([
        fetchRoomDirectoryList({ page: 1, limit: 1, hostel }),
        fetchBedDirectoryList({ page: 1, limit: 1, hostel, status: 'Available' }),
        fetchBedDirectoryList({ page: 1, limit: 1, hostel, status: 'Occupied' }),
        fetchRoomDirectoryList({ page: 1, limit: 1, hostel, status: 'Maintenance' }),
      ]);
      const err = roomsAll.error ?? bedsAvail.error ?? bedsOcc.error ?? roomsMaint.error ?? null;
      if (err) {
        setError(err);
        if (!silent) {
          setStats(null);
        }
      } else {
        setStats({
          totalRooms: roomsAll.total ?? 0,
          availableBeds: bedsAvail.total ?? 0,
          occupiedBeds: bedsOcc.total ?? 0,
          maintenanceRooms: roomsMaint.total ?? 0,
        });
        setLastSyncedAt(new Date().toISOString());
      }
      setLoading(false);
    },
    [hostel],
  );

  useEffect(() => {
    void load(false);
    const interval = window.setInterval(() => {
      void load(true);
    }, LIVE_POLL_MS);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void load(true);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [load]);

  return { stats, loading, error, lastSyncedAt, refresh: () => load(false) };
}
