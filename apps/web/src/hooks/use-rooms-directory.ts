'use client';

import { useCallback, useEffect, useState } from 'react';

import type { RoomRecord } from '@/components/dashboard/rooms/admin-rooms-data';
import {
  type RoomDirectorySummary,
  fetchRoomDirectoryList,
  fetchRoomDirectorySummary,
} from '@/lib/api/rooms';

export type RoomDirectoryFilters = {
  q: string;
  hostel: string;
  block: string;
  floor: string;
  roomType: string;
  status: string;
  occupancy: string;
  page: number;
  pageSize: number;
};

type UseRoomsDirectoryOptions = { pollIntervalMs?: number };

export function useRoomsDirectory(filters: RoomDirectoryFilters, options?: UseRoomsDirectoryOptions) {
  const pollIntervalMs = options?.pollIntervalMs ?? 60_000;
  const [summary, setSummary] = useState<RoomDirectorySummary | null>(null);
  const [rooms, setRooms] = useState<RoomRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    const result = await fetchRoomDirectorySummary();
    if (result.summary) {
      setSummary(result.summary);
    } else if (result.error) {
      setError(result.error);
    }
    setLoadingSummary(false);
  }, []);

  const loadList = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) {
      setLoadingList(true);
    }
    setError(null);
    const result = await fetchRoomDirectoryList({
      page: filters.page,
      limit: filters.pageSize,
      q: filters.q,
      hostel: filters.hostel,
      block: filters.block,
      floor: filters.floor,
      roomType: filters.roomType,
      status: filters.status,
      occupancy: filters.occupancy,
    });
    if (result.rooms) {
      setRooms(result.rooms);
      setTotal(result.total ?? result.rooms.length);
    } else if (result.error) {
      setError(result.error);
      setRooms([]);
      setTotal(0);
    }
    if (!opts?.silent) {
      setLoadingList(false);
    }
  }, [filters]);

  useEffect(() => {
    void loadSummary();
    const interval = setInterval(() => {
      void loadSummary();
    }, pollIntervalMs);
    return () => clearInterval(interval);
  }, [loadSummary, pollIntervalMs]);

  useEffect(() => {
    void loadList();
    const interval = setInterval(() => {
      void loadList({ silent: true });
    }, pollIntervalMs);
    return () => clearInterval(interval);
  }, [loadList, pollIntervalMs]);

  const refresh = useCallback(() => {
    void loadSummary();
    void loadList();
  }, [loadList, loadSummary]);

  return {
    summary,
    rooms,
    total,
    loadingSummary,
    loadingList,
    error,
    refresh,
  };
}
