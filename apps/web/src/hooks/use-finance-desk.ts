'use client';

import { useCallback, useEffect, useState } from 'react';

import type { LedgerAccount, LedgerLine } from '@/components/dashboard/fees/admin-fees-data';
import {
  fetchFinanceDeskLedgers,
  fetchFinanceDeskSummary,
  fetchFinanceLedgerDetail,
  type FinanceCollectionTrendPoint,
  type FinanceDeskSummary,
  type FinancePendingWaiver,
} from '@/lib/api/finance';

export type FinanceDeskFilters = {
  q: string;
  hostel: string;
  status: string;
  page: number;
  limit: number;
};

type UseFinanceDeskOptions = { pollIntervalMs?: number };

export function useFinanceDesk(filters: FinanceDeskFilters, options?: UseFinanceDeskOptions) {
  const pollIntervalMs = options?.pollIntervalMs ?? 20_000;
  const [summary, setSummary] = useState<FinanceDeskSummary | null>(null);
  const [ledgers, setLedgers] = useState<LedgerAccount[]>([]);
  const [collectionTrend, setCollectionTrend] = useState<FinanceCollectionTrendPoint[]>([]);
  const [total, setTotal] = useState(0);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [detailLines, setDetailLines] = useState<LedgerLine[]>([]);
  const [detailWaivers, setDetailWaivers] = useState<FinancePendingWaiver[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const loadSummary = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoadingSummary(true);
    const result = await fetchFinanceDeskSummary();
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
      const result = await fetchFinanceDeskLedgers({
        page: filters.page,
        limit: filters.limit,
        q: filters.q,
        hostel: filters.hostel,
        status: filters.status,
      });
      if (result.ledgers) {
        setLedgers(result.ledgers);
        setTotal(result.total ?? result.ledgers.length);
        if (result.collectionTrend) setCollectionTrend(result.collectionTrend);
        setError(null);
      } else if (result.error) {
        setError(result.error);
        if (!opts?.silent) {
          setLedgers([]);
          setTotal(0);
        }
      }
      if (!opts?.silent) setLoadingList(false);
    },
    [filters],
  );

  const loadDetail = useCallback(async (ledgerId: string) => {
    if (!ledgerId) return;
    setLoadingDetail(true);
    const result = await fetchFinanceLedgerDetail(ledgerId);
    if (result.lines) setDetailLines(result.lines);
    if (result.pendingWaivers) setDetailWaivers(result.pendingWaivers);
    setLoadingDetail(false);
  }, []);

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
    ledgers,
    collectionTrend,
    total,
    loadingSummary,
    loadingList,
    error,
    refresh,
    loadDetail,
    detailLines,
    detailWaivers,
    loadingDetail,
  };
}
