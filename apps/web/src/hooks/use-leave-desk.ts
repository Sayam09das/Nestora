'use client';

import { useCallback, useEffect, useState } from 'react';

import type { LeaveRecord } from '@/components/dashboard/leave/admin-leave-data';
import {
  fetchLeaveDeskApplications,
  fetchLeaveDeskSummary,
  type LeaveDeskSummary,
} from '@/lib/api/leaves';

export type LeaveDeskFilters = {
  q: string;
  hostel: string;
  category: string;
  status: string;
};

type UseLeaveDeskOptions = { pollIntervalMs?: number };

export function useLeaveDesk(filters: LeaveDeskFilters, options?: UseLeaveDeskOptions) {
  const pollIntervalMs = options?.pollIntervalMs ?? 20_000;
  const [summary, setSummary] = useState<LeaveDeskSummary | null>(null);
  const [applications, setApplications] = useState<LeaveRecord[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoadingSummary(true);
    const result = await fetchLeaveDeskSummary();
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
      const result = await fetchLeaveDeskApplications({
        q: filters.q,
        hostel: filters.hostel,
        category: filters.category,
        status: filters.status,
      });
      if (result.applications) {
        setApplications(result.applications);
        setError(null);
      } else if (result.error) {
        setError(result.error);
        if (!opts?.silent) setApplications([]);
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

  const patchApplication = useCallback((leaveId: string, patch: Partial<LeaveRecord> | LeaveRecord) => {
    setApplications((prev) => prev.map((row) => (row.id === leaveId ? { ...row, ...patch } : row)));
  }, []);

  return {
    summary,
    applications,
    loadingSummary,
    loadingList,
    error,
    refresh,
    patchApplication,
  };
}
