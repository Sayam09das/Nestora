'use client';

import { useCallback, useEffect, useState } from 'react';

import type { SettingField, SettingsPanel } from '@/components/dashboard/settings/admin-settings-data';
import {
  fetchSettingsDeskPanels,
  fetchSettingsDeskSummary,
  fetchSettingsPanelDetail,
  type SettingsDeskSummary,
} from '@/lib/api/settings';

export type SettingsDeskFilters = {
  q: string;
  category: string;
  scope: string;
  status: string;
  hostel?: string;
};

type Options = { pollIntervalMs?: number; summaryHostel?: string };

export function useSettingsDesk(filters: SettingsDeskFilters, selectedId: string, options?: Options) {
  const pollIntervalMs = options?.pollIntervalMs ?? 20_000;
  const summaryHostel = options?.summaryHostel;
  const [summary, setSummary] = useState<SettingsDeskSummary | null>(null);
  const [panels, setPanels] = useState<SettingsPanel[]>([]);
  const [tuneFields, setTuneFields] = useState<SettingField[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingTune, setLoadingTune] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoadingSummary(true);
    const result = await fetchSettingsDeskSummary(summaryHostel);
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
      const result = await fetchSettingsDeskPanels({
        q: filters.q,
        category: filters.category,
        scope: filters.scope,
        status: filters.status,
        hostel: filters.hostel ?? summaryHostel,
      });
      if (result.panels) {
        setPanels(result.panels);
        setError(null);
      } else if (result.error) {
        setError(result.error);
        if (!opts?.silent) setPanels([]);
      }
      if (!opts?.silent) setLoadingList(false);
    },
    [filters, summaryHostel],
  );

  const loadTune = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!selectedId) return;
      if (!opts?.silent) setLoadingTune(true);
      const result = await fetchSettingsPanelDetail(selectedId, { hostel: filters.hostel ?? summaryHostel });
      if (result.detail) {
        setTuneFields(result.detail.fields);
        setError(null);
      } else if (result.error) {
        setError(result.error);
        if (!opts?.silent) setTuneFields([]);
      }
      if (!opts?.silent) setLoadingTune(false);
    },
    [selectedId, filters.hostel, summaryHostel],
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
    void loadTune();
    const interval = setInterval(() => void loadTune({ silent: true }), pollIntervalMs);
    return () => clearInterval(interval);
  }, [loadTune, pollIntervalMs]);

  useEffect(() => {
    const refresh = () => {
      void loadSummary({ silent: true });
      void loadList({ silent: true });
      void loadTune({ silent: true });
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
  }, [loadList, loadSummary, loadTune]);

  const refresh = useCallback(() => {
    setLoadingSummary(true);
    setLoadingList(true);
    setLoadingTune(true);
    void loadSummary();
    void loadList();
    void loadTune();
  }, [loadList, loadSummary, loadTune]);

  return {
    summary,
    panels,
    tuneFields,
    loadingSummary,
    loadingList,
    loadingTune,
    error,
    refresh,
  };
}
