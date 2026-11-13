'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  fetchDailyRegisterDeskEntries,
  fetchDailyRegisterDeskSummary,
  type DailyRegisterDeskSummary,
  type DailyRegisterEntry,
} from '@/lib/api/daily-register';

export type DailyRegisterDeskFilters = {
  date: string;
  hostel: string;
  category: string;
  q: string;
};

type Options = { pollIntervalMs?: number };

export function useDailyRegisterDesk(filters: DailyRegisterDeskFilters, options?: Options) {
  const pollIntervalMs = options?.pollIntervalMs ?? 20_000;
  const [summary, setSummary] = useState<DailyRegisterDeskSummary | null>(null);
  const [entries, setEntries] = useState<DailyRegisterEntry[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) setLoadingSummary(true);
      const result = await fetchDailyRegisterDeskSummary({
        date: filters.date,
        hostel: filters.hostel,
      });
      if (result.summary) {
        setSummary(result.summary);
        setError(null);
      } else if (result.error) {
        setError(result.error);
      }
      if (!opts?.silent) setLoadingSummary(false);
    },
    [filters.date, filters.hostel],
  );

  const loadList = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) setLoadingList(true);
      const result = await fetchDailyRegisterDeskEntries({
        date: filters.date,
        hostel: filters.hostel,
        category: filters.category,
        q: filters.q,
      });
      if (result.entries) {
        setEntries(result.entries);
        setError(null);
      } else if (result.error) {
        setError(result.error);
        if (!opts?.silent) setEntries([]);
      }
      if (!opts?.silent) setLoadingList(false);
    },
    [filters],
  );

  useEffect(() => {
    void loadSummary();
    const interval = setInterval(() => void loadSummary({ silent: true }), pollIntervalMs);
    return () => clearInterval(interval);
  }, [loadSummary, pollIntervalMs]);

  useEffect(() => {
    void loadList();
    const interval = setInterval(() => void loadList({ silent: true }), pollIntervalMs);
    return () => clearInterval(interval);
  }, [loadList, pollIntervalMs]);

  useEffect(() => {
    const refresh = () => {
      void loadSummary({ silent: true });
      void loadList({ silent: true });
    };
    window.addEventListener('focus', refresh);
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [loadList, loadSummary]);

  const refresh = useCallback(() => {
    setLoadingSummary(true);
    setLoadingList(true);
    void loadSummary();
    void loadList();
  }, [loadList, loadSummary]);

  return {
    summary,
    entries,
    loadingSummary,
    loadingList,
    error,
    refresh,
  };
}
