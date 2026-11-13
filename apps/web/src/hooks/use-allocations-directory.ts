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

type UseAllocationsDirectoryOptions = { pollIntervalMs?: number };

export function useAllocationsDirectory(
  filters: AllocationDirectoryFilters,
  options?: UseAllocationsDirectoryOptions,
) {
  const pollIntervalMs = options?.pollIntervalMs ?? 20_000;
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
      setError(null);
    } else if (result.error) {
      setError(result.error);
      if (!opts?.silent) {
        setAllocations([]);
        setTotal(0);
      }
    }
    if (!opts?.silent) {
      setLoadingList(false);
    }
  }, [filters]);

  const loadQueue = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) {
      setLoadingQueue(true);
    }
    const result = await fetchAllocationQueue();
    if (result.queue) {
      setQueue(result.queue);
    }
    if (!opts?.silent) {
      setLoadingQueue(false);
    }
  }, []);

  useEffect(() => {
    void loadSummary();
    const interval = setInterval(() => void loadSummary(), pollIntervalMs);
    return () => clearInterval(interval);
  }, [loadSummary, pollIntervalMs]);

  useEffect(() => {
    void loadList();
    const interval = setInterval(() => void loadList({ silent: true }), pollIntervalMs);
    return () => clearInterval(interval);
  }, [loadList, pollIntervalMs]);

  useEffect(() => {
    void loadQueue();
    const interval = setInterval(() => void loadQueue({ silent: true }), pollIntervalMs);
    return () => clearInterval(interval);
  }, [loadQueue, pollIntervalMs]);

  useEffect(() => {
    const onFocus = () => {
      void loadSummary();
      void loadList({ silent: true });
      void loadQueue({ silent: true });
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [loadList, loadQueue, loadSummary]);

  const refresh = useCallback(() => {
    setLoadingSummary(true);
    setLoadingList(true);
    setLoadingQueue(true);
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
