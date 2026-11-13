'use client';

import { useCallback, useEffect, useState } from 'react';

import type { ComplaintTicket } from '@/components/dashboard/complaints/admin-complaints-data';
import {
  fetchComplaintsDeskSummary,
  fetchComplaintsDeskTickets,
  type ComplaintsDeskSummary,
} from '@/lib/api/complaints';

export type ComplaintsDeskFilters = {
  q: string;
  hostel: string;
  category: string;
  priority: string;
  status: string;
};

type UseComplaintsDeskOptions = { pollIntervalMs?: number; summaryHostel?: string };

export function useComplaintsDesk(filters: ComplaintsDeskFilters, options?: UseComplaintsDeskOptions) {
  const pollIntervalMs = options?.pollIntervalMs ?? 20_000;
  const summaryHostel = options?.summaryHostel;
  const [summary, setSummary] = useState<ComplaintsDeskSummary | null>(null);
  const [tickets, setTickets] = useState<ComplaintTicket[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoadingSummary(true);
    const result = await fetchComplaintsDeskSummary(summaryHostel);
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
      const result = await fetchComplaintsDeskTickets({
        q: filters.q,
        hostel: filters.hostel,
        category: filters.category,
        priority: filters.priority,
        status: filters.status,
      });
      if (result.tickets) {
        setTickets(result.tickets);
        setError(null);
      } else if (result.error) {
        setError(result.error);
        if (!opts?.silent) setTickets([]);
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

  const patchTicket = useCallback((ticketId: string, patch: Partial<ComplaintTicket> | ComplaintTicket) => {
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, ...patch } : t)));
  }, []);

  return {
    summary,
    tickets,
    loadingSummary,
    loadingList,
    error,
    refresh,
    patchTicket,
  };
}
