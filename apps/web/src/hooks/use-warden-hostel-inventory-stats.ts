'use client';

import { useCallback, useEffect, useState } from 'react';

import { fetchBedDirectoryList } from '@/lib/api/beds';
import { fetchRoomDirectoryList } from '@/lib/api/rooms';

export type WardenHostelInventoryStats = {
  totalRooms: number;
  availableBeds: number;
  occupiedBeds: number;
  maintenanceRooms: number;
};

export function useWardenHostelInventoryStats(hostelApiFilter: string) {
  const [stats, setStats] = useState<WardenHostelInventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!hostelApiFilter) {
      setStats(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const hostel = hostelApiFilter;
    const [roomsAll, bedsAvail, bedsOcc, roomsMaint] = await Promise.all([
      fetchRoomDirectoryList({ page: 1, limit: 1, hostel }),
      fetchBedDirectoryList({ page: 1, limit: 1, hostel, status: 'Available' }),
      fetchBedDirectoryList({ page: 1, limit: 1, hostel, status: 'Occupied' }),
      fetchRoomDirectoryList({ page: 1, limit: 1, hostel, status: 'Maintenance' }),
    ]);
    const err =
      roomsAll.error ?? bedsAvail.error ?? bedsOcc.error ?? roomsMaint.error ?? null;
    if (err) {
      setError(err);
      setStats(null);
    } else {
      setStats({
        totalRooms: roomsAll.total ?? 0,
        availableBeds: bedsAvail.total ?? 0,
        occupiedBeds: bedsOcc.total ?? 0,
        maintenanceRooms: roomsMaint.total ?? 0,
      });
    }
    setLoading(false);
  }, [hostelApiFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  return { stats, loading, error, refresh: load };
}
