'use client';

import { useCallback, useEffect, useState } from 'react';

import type { BedRecord } from '@/components/dashboard/beds/admin-beds-data';
import {
  type BedDirectorySummary,
  fetchBedDirectoryList,
  fetchBedDirectorySummary,
} from '@/lib/api/beds';

export type BedDirectoryFilters = {
  q: string;
  hostel: string;
  block: string;
  floor: string;
  room: string;
  status: string;
  page: number;
  pageSize: number;
};

type UseBedsDirectoryOptions = { pollIntervalMs?: number };

export function useBedsDirectory(filters: BedDirectoryFilters, options?: UseBedsDirectoryOptions) {
  const pollIntervalMs = options?.pollIntervalMs ?? 20_000;
  const [summary, setSummary] = useState<BedDirectorySummary | null>(null);
  const [beds, setBeds] = useState<BedRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    const result = await fetchBedDirectorySummary();
    if (result.summary) {
      setSummary(result.summary);
      setError(null);
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
    const result = await fetchBedDirectoryList({
      page: filters.page,
      limit: filters.pageSize,
      q: filters.q,
      hostel: filters.hostel,
      block: filters.block,
      floor: filters.floor,
      room: filters.room,
      status: filters.status,
    });
    if (result.beds) {
      setBeds(result.beds);
      setTotal(result.total ?? result.beds.length);
    } else if (result.error) {
      setError(result.error);
      setBeds([]);
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

  useEffect(() => {
    const onFocus = () => {
      void loadSummary();
      void loadList({ silent: true });
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [loadList, loadSummary]);

  const refresh = useCallback(() => {
    void loadSummary();
    void loadList();
  }, [loadList, loadSummary]);

  return {
    summary,
    beds,
    total,
    loadingSummary,
    loadingList,
    error,
    refresh,
  };
}
