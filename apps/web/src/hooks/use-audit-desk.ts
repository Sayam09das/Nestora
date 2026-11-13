'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  fetchAuditDeskSummary,
  fetchAuditLogs,
  type AuditDeskSummary,
  type AuditLogRow,
} from '@/lib/api/audit';

export type AuditDeskFilters = {
  q: string;
  actionName: string;
};

type Options = { pollIntervalMs?: number; pageLimit?: number };

export function useAuditDesk(filters: AuditDeskFilters, options?: Options) {
  const pollIntervalMs = options?.pollIntervalMs ?? 20_000;
  const pageLimit = options?.pageLimit ?? 80;

  const [summary, setSummary] = useState<AuditDeskSummary | null>(null);
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoadingSummary(true);
    const result = await fetchAuditDeskSummary();
    if (result.summary) {
      setSummary(result.summary);
      setError(null);
    } else if (result.error) {
      setError(result.error);
    }
    if (!opts?.silent) setLoadingSummary(false);
  }, []);

  const loadList = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) setLoadingList(true);
      const result = await fetchAuditLogs({
        page: 1,
        limit: pageLimit,
        ...(filters.q.trim() ? { q: filters.q.trim() } : {}),
        ...(filters.actionName.trim() ? { actionName: filters.actionName.trim() } : {}),
      });
      if (result.logs) {
        setLogs(result.logs);
        setError(null);
      } else if (result.error) {
        setError(result.error);
        if (!opts?.silent) setLogs([]);
      }
      if (!opts?.silent) setLoadingList(false);
    },
    [filters.actionName, filters.q, pageLimit],
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
    const onFocus = () => {
      void loadSummary({ silent: true });
      void loadList({ silent: true });
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [loadList, loadSummary]);

  const refresh = useCallback(() => {
    setLoadingSummary(true);
    setLoadingList(true);
    void loadSummary();
    void loadList();
  }, [loadList, loadSummary]);

  return {
    summary,
    logs,
    loadingSummary,
    loadingList,
    error,
    refresh,
    apiOnline: summary !== null,
  };
}
