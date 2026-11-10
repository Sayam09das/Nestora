'use client';

import { useCallback, useEffect, useState } from 'react';

import type { HostelRecord } from '@/components/dashboard/hostels/admin-hostels-data';
import {
  type HostelDirectorySummary,
  fetchHostelDirectoryList,
  fetchHostelDirectorySummary,
} from '@/lib/api/hostels';

export type HostelDirectoryFilters = {
  q: string;
  gender: string;
  campus: string;
  status: string;
  occupancy: string;
  page: number;
  pageSize: number;
};

export function useHostelsDirectory(filters: HostelDirectoryFilters) {
  const [summary, setSummary] = useState<HostelDirectorySummary | null>(null);
  const [hostels, setHostels] = useState<HostelRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    const result = await fetchHostelDirectorySummary();
    if (result.summary) setSummary(result.summary);
    else if (result.error) setError(result.error);
    setLoadingSummary(false);
  }, []);

  const loadList = useCallback(async () => {
    setLoadingList(true);
    setError(null);
    const result = await fetchHostelDirectoryList({
      page: filters.page,
      limit: filters.pageSize,
      q: filters.q,
      gender: filters.gender,
      campus: filters.campus,
      status: filters.status,
      occupancy: filters.occupancy,
    });
    if (result.hostels) {
      setHostels(result.hostels);
      setTotal(result.total ?? result.hostels.length);
    } else if (result.error) {
      setError(result.error);
      setHostels([]);
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

  return { summary, hostels, total, loadingSummary, loadingList, error, refresh };
}
