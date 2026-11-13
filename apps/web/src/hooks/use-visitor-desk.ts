'use client';

import { useCallback, useEffect, useState } from 'react';

import type { VisitorDeskRecord } from '@/components/dashboard/visitors/visitor-desk-data';
import {
  fetchVisitorDeskRecords,
  fetchVisitorDeskSummary,
  type VisitorDeskSummary,
} from '@/lib/api/visitors';

export type VisitorDeskFilters = {
  q: string;
  hostel: string;
  status: string;
};

type Options = { pollIntervalMs?: number; summaryHostel?: string };

export function useVisitorDesk(filters: VisitorDeskFilters, options?: Options) {
  const pollIntervalMs = options?.pollIntervalMs ?? 20_000;
  const summaryHostel = options?.summaryHostel;
  const [summary, setSummary] = useState<VisitorDeskSummary | null>(null);
  const [records, setRecords] = useState<VisitorDeskRecord[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoadingSummary(true);
    const result = await fetchVisitorDeskSummary(summaryHostel);
    if (result.summary) {
      setSummary(result.summary);
      setError(null);
    } else if (result.error) {
      setError(result.error);
    }
    if (!opts?.silent) setLoadingSummary(false);
  }, [summaryHostel]);

  const loadList = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) setLoadingList(true);
      const result = await fetchVisitorDeskRecords({
        q: filters.q,
        hostel: filters.hostel,
        status: filters.status,
      });
      if (result.records) {
        setRecords(result.records);
        setError(null);
      } else if (result.error) {
        setError(result.error);
        if (!opts?.silent) setRecords([]);
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

  const patchRecord = useCallback((id: string, patch: Partial<VisitorDeskRecord> | VisitorDeskRecord) => {
    setRecords((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }, []);

  return {
    summary,
    records,
    loadingSummary,
    loadingList,
    error,
    refresh,
    patchRecord,
  };
}
