'use client';

import { useCallback, useEffect, useState } from 'react';

import type { ReportTemplate } from '@/components/dashboard/reports/admin-reports-data';
import {
  fetchReportDeskPreview,
  fetchReportsDeskSummary,
  fetchReportsDeskTemplates,
  type ReportDeskPreview,
  type ReportsDeskSummary,
} from '@/lib/api/reports';

export type ReportsDeskFilters = {
  q: string;
  category: string;
  hostel: string;
  period: string;
};

type Options = { pollIntervalMs?: number };

export function useReportsDesk(
  filters: ReportsDeskFilters,
  selectedId: string,
  options?: Options,
) {
  const pollIntervalMs = options?.pollIntervalMs ?? 20_000;
  const [summary, setSummary] = useState<ReportsDeskSummary | null>(null);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [preview, setPreview] = useState<ReportDeskPreview | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoadingSummary(true);
    const result = await fetchReportsDeskSummary();
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
      const result = await fetchReportsDeskTemplates({
        q: filters.q,
        category: filters.category,
        hostel: filters.hostel,
        period: filters.period,
      });
      if (result.templates) {
        setTemplates(result.templates);
        setError(null);
      } else if (result.error) {
        setError(result.error);
        if (!opts?.silent) setTemplates([]);
      }
      if (!opts?.silent) setLoadingList(false);
    },
    [filters],
  );

  const loadPreview = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!selectedId) return;
      if (!opts?.silent) setLoadingPreview(true);
      const result = await fetchReportDeskPreview(selectedId, {
        hostel: filters.hostel,
        period: filters.period,
      });
      if (result.preview) {
        setPreview(result.preview);
        setError(null);
      } else if (result.error) {
        setError(result.error);
        if (!opts?.silent) setPreview(null);
      }
      if (!opts?.silent) setLoadingPreview(false);
    },
    [filters.hostel, filters.period, selectedId],
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
    void loadPreview();
    const interval = setInterval(() => void loadPreview({ silent: true }), pollIntervalMs);
    return () => clearInterval(interval);
  }, [loadPreview, pollIntervalMs]);

  useEffect(() => {
    const refresh = () => {
      void loadSummary({ silent: true });
      void loadList({ silent: true });
      void loadPreview({ silent: true });
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
  }, [loadList, loadPreview, loadSummary]);

  const refresh = useCallback(() => {
    setLoadingSummary(true);
    setLoadingList(true);
    setLoadingPreview(true);
    void loadSummary();
    void loadList();
    void loadPreview();
  }, [loadList, loadPreview, loadSummary]);

  return {
    summary,
    templates,
    preview,
    loadingSummary,
    loadingList,
    loadingPreview,
    error,
    refresh,
  };
}
