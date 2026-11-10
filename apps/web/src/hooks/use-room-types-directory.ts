'use client';

import { useCallback, useEffect, useState } from 'react';

import type { RoomTypeRecord } from '@/components/dashboard/room-types/admin-room-types-data';
import {
  type RoomTypeDirectorySummary,
  fetchRoomTypeDirectoryList,
  fetchRoomTypeDirectorySummary,
} from '@/lib/api/room-types';

export type RoomTypeDirectoryFilters = {
  q: string;
  hostel: string;
  category: string;
  capacity: string;
  price: string;
  status: string;
  page: number;
  pageSize: number;
};

export function useRoomTypesDirectory(filters: RoomTypeDirectoryFilters) {
  const [summary, setSummary] = useState<RoomTypeDirectorySummary | null>(null);
  const [roomTypes, setRoomTypes] = useState<RoomTypeRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    const result = await fetchRoomTypeDirectorySummary();
    if (result.summary) setSummary(result.summary);
    else if (result.error) setError(result.error);
    setLoadingSummary(false);
  }, []);

  const loadList = useCallback(async () => {
    setLoadingList(true);
    setError(null);
    const result = await fetchRoomTypeDirectoryList({
      page: filters.page,
      limit: filters.pageSize,
      q: filters.q,
      hostel: filters.hostel,
      category: filters.category,
      capacity: filters.capacity,
      price: filters.price,
      status: filters.status,
    });
    if (result.roomTypes) {
      setRoomTypes(result.roomTypes);
      setTotal(result.total ?? result.roomTypes.length);
    } else if (result.error) {
      setError(result.error);
      setRoomTypes([]);
      setTotal(0);
    }
    setLoadingList(false);
  }, [filters]);

  useEffect(() => {
    void loadSummary();
    const interval = setInterval(() => void loadSummary(), 60_000);
    return () => clearInterval(interval);
  }, [loadSummary]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const refresh = useCallback(() => {
    void loadSummary();
    void loadList();
  }, [loadList, loadSummary]);

  return { summary, roomTypes, total, loadingSummary, loadingList, error, refresh };
}
