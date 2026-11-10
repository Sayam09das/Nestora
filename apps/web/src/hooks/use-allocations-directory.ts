'use client';

import { useCallback, useEffect, useState } from 'react';

import type { AllocationRecord } from '@/components/dashboard/allocation/admin-allocation-data';
import {
  type AllocationDirectorySummary,
  fetchAllocationDirectoryList,
  fetchAllocationDirectorySummary,
  fetchAllocationQueue,
} from '@/lib/api/allocations';

export type AllocationDirectoryFilters = {
  q: string;
  status: string;
  type: string;
  hostel: string;
  page: number;
  pageSize: number;
};

export function useAllocationsDirectory(filters: AllocationDirectoryFilters) {
  const [summary, setSummary] = useState<AllocationDirectorySummary | null>(null);
  const [allocations, setAllocations] = useState<AllocationRecord[]>([]);
  const [queue, setQueue] = useState<AllocationRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    const result = await fetchAllocationDirectorySummary();
    if (result.summary) setSummary(result.summary);
    else if (result.error) setError(result.error);
    setLoadingSummary(false);
  }, []);

  const loadList = useCallback(async () => {
    setLoadingList(true);
    setError(null);
    const result = await fetchAllocationDirectoryList({
      page: filters.page,
      limit: filters.pageSize,
      q: filters.q,
      status: filters.status,
      type: filters.type,
      hostel: filters.hostel,
    });
    if (result.allocations) {
      setAllocations(result.allocations);
      setTotal(result.total ?? result.allocations.length);
    } else if (result.error) {
      setError(result.error);
      setAllocations([]);
      setTotal(0);
    }
    setLoadingList(false);
  }, [filters]);

  const loadQueue = useCallback(async () => {
    setLoadingQueue(true);
    const result = await fetchAllocationQueue();
    if (result.queue) setQueue(result.queue);
    setLoadingQueue(false);
  }, []);

  useEffect(() => {
    void loadSummary();
    const interval = setInterval(() => void loadSummary(), 60_000);
    return () => clearInterval(interval);
  }, [loadSummary]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  const refresh = useCallback(() => {
    void loadSummary();
    void loadList();
    void loadQueue();
  }, [loadList, loadQueue, loadSummary]);

  return {
    summary,
    allocations,
    queue,
    total,
    loadingSummary,
    loadingList,
    loadingQueue,
    error,
    refresh,
  };
}
