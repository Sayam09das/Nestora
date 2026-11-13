'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { StaffRecord, StaffStatus } from '@/components/dashboard/staff/admin-staff-data';
import {
  type StaffDirectorySummary,
  fetchStaffDirectoryList,
  fetchStaffDirectorySummary,
} from '@/lib/api/staff';

const LIVE_POLL_MS = 20_000;

export type StaffDirectoryFilters = {
  q: string;
  status: string;
  role: string;
  department: string;
  hostel: string;
  page: number;
  pageSize: number;
  variant: 'all' | 'wardens';
};

export function useStaffDirectory(filters: StaffDirectoryFilters) {
  const [summary, setSummary] = useState<StaffDirectorySummary | null>(null);
  const [staff, setStaff] = useState<StaffRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const loadSummary = useCallback(async (silent = false) => {
    if (!silent) {
      setLoadingSummary(true);
    }
    const result = await fetchStaffDirectorySummary(filtersRef.current.variant);
    if (result.summary) {
      setSummary(result.summary);
    } else if (result.error && !silent) {
      setError(result.error);
    }
    setLoadingSummary(false);
  }, []);

  const loadList = useCallback(async (silent = false) => {
    if (!silent) {
      setLoadingList(true);
    }
    setError(null);
    const f = filtersRef.current;
    const status = f.status !== 'All Status' ? (f.status as StaffStatus) : undefined;
    const result = await fetchStaffDirectoryList({
      page: f.page,
      limit: f.pageSize,
      q: f.q,
      status,
      role: f.role,
      department: f.department,
      hostel: f.hostel,
      variant: f.variant,
    });
    if (result.staff) {
      setStaff(result.staff);
      setTotal(result.total ?? result.staff.length);
    } else if (result.error) {
      setError(result.error);
      if (!silent) {
        setStaff([]);
        setTotal(0);
      }
    }
    setLoadingList(false);
  }, []);

  useEffect(() => {
    void loadSummary(false);
    void loadList(false);
  }, [loadList, loadSummary, filters]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void loadSummary(true);
      void loadList(true);
    }, LIVE_POLL_MS);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void loadSummary(true);
        void loadList(true);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [loadList, loadSummary]);

  const refresh = useCallback(() => {
    void loadSummary(false);
    void loadList(false);
  }, [loadList, loadSummary]);

  return {
    summary,
    staff,
    total,
    loadingSummary,
    loadingList,
    error,
    refresh,
  };
}
