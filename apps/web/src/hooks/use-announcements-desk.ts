'use client';

import { useCallback, useEffect, useState } from 'react';

import type { AnnouncementRecord } from '@/components/dashboard/announcements/admin-announcements-data';
import {
  fetchAnnouncementsDeskNotices,
  fetchAnnouncementsDeskSummary,
  type AnnouncementsDeskSummary,
} from '@/lib/api/announcements';

export type AnnouncementsDeskFilters = {
  q: string;
  category: string;
  scope: string;
  status: string;
};

type Options = { pollIntervalMs?: number; summaryScope?: string };

export function useAnnouncementsDesk(filters: AnnouncementsDeskFilters, options?: Options) {
  const pollIntervalMs = options?.pollIntervalMs ?? 20_000;
  const summaryScope = options?.summaryScope;
  const [summary, setSummary] = useState<AnnouncementsDeskSummary | null>(null);
  const [notices, setNotices] = useState<AnnouncementRecord[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoadingSummary(true);
    const result = await fetchAnnouncementsDeskSummary(summaryScope);
    if (result.summary) {
      setSummary(result.summary);
      setError(null);
    } else if (result.error) {
      setError(result.error);
    }
    if (!opts?.silent) setLoadingSummary(false);
  }, [summaryScope]);

  const loadList = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) setLoadingList(true);
      const result = await fetchAnnouncementsDeskNotices({
        q: filters.q,
        category: filters.category,
        scope: filters.scope,
        status: filters.status,
      });
      if (result.notices) {
        setNotices(result.notices);
        setError(null);
      } else if (result.error) {
        setError(result.error);
        if (!opts?.silent) setNotices([]);
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

  return { summary, notices, loadingSummary, loadingList, error, refresh };
}
