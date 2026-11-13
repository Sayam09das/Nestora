'use client';

import { useCallback, useEffect, useState } from 'react';

import type { IncidentDeskRecord } from '@/components/dashboard/incidents/incident-desk-data';
import {
  fetchIncidentsDeskRecords,
  fetchIncidentsDeskSummary,
  type IncidentsDeskSummary,
} from '@/lib/api/incidents';

export type IncidentDeskFilters = {
  q: string;
  hostel: string;
  type: string;
  severity: string;
  status: string;
};

type UseIncidentDeskOptions = { pollIntervalMs?: number; summaryHostel?: string };

export function useIncidentDesk(filters: IncidentDeskFilters, options?: UseIncidentDeskOptions) {
  const pollIntervalMs = options?.pollIntervalMs ?? 20_000;
  const summaryHostel = options?.summaryHostel;
  const [summary, setSummary] = useState<IncidentsDeskSummary | null>(null);
  const [records, setRecords] = useState<IncidentDeskRecord[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoadingSummary(true);
    const result = await fetchIncidentsDeskSummary(summaryHostel);
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
      const result = await fetchIncidentsDeskRecords({
        q: filters.q,
        hostel: filters.hostel,
        type: filters.type,
        severity: filters.severity,
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

  const patchRecord = useCallback((id: string, patch: Partial<IncidentDeskRecord> | IncidentDeskRecord) => {
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
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
