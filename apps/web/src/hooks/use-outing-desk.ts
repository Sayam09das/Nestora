'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  fetchOutingDeskApplications,
  fetchOutingDeskSummary,
  patchOutingDecision,
  type OutingDeskRow,
  type OutingDeskSummary,
} from '@/lib/api/outings';

export type OutingDeskFilters = { q: string; hostel: string; status: string };

export function useOutingDesk(filters: OutingDeskFilters, pollIntervalMs = 20_000) {
  const [summary, setSummary] = useState<OutingDeskSummary | null>(null);
  const [applications, setApplications] = useState<OutingDeskRow[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoadingSummary(true);
    const result = await fetchOutingDeskSummary();
    if (result.summary) {
      setSummary(result.summary);
      setError(null);
    } else if (result.error) setError(result.error);
    if (!opts?.silent) setLoadingSummary(false);
  }, []);

  const loadList = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) setLoadingList(true);
      const result = await fetchOutingDeskApplications(filters);
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

  const refresh = useCallback(async () => {
    await Promise.all([loadSummary({ silent: true }), loadList({ silent: true })]);
  }, [loadList, loadSummary]);

  useEffect(() => {
    void loadSummary();
    void loadList();
    const id = window.setInterval(() => void refresh(), pollIntervalMs);
    return () => window.clearInterval(id);
  }, [loadList, loadSummary, refresh, pollIntervalMs]);

  const decide = useCallback(
    async (outingId: string, decision: 'Approved' | 'Rejected', feedback?: string) => {
      const result = await patchOutingDecision(outingId, { decision, feedback });
      if (result.application) {
        setApplications((current) =>
          current.map((row) => (row.id === outingId ? result.application! : row)),
        );
        await refresh();
        return { ok: true as const };
      }
      return { ok: false as const, error: result.error ?? 'Decision failed.' };
    },
    [refresh],
  );

  return {
    summary,
    applications,
    loadingSummary,
    loadingList,
    error,
    refresh,
    decide,
  };
}