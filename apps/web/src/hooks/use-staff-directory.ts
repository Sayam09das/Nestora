'use client';

import { useCallback, useEffect, useState } from 'react';

import type { StaffRecord, StaffStatus } from '@/components/dashboard/staff/admin-staff-data';
import {
  type StaffDirectorySummary,
  fetchStaffDirectoryList,
  fetchStaffDirectorySummary,
} from '@/lib/api/staff';

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

  const loadSummary = useCallback(async () => {
    const result = await fetchStaffDirectorySummary(filters.variant);
    if (result.summary) {
      setSummary(result.summary);
    } else if (result.error) {
      setError(result.error);
    }
    setLoadingSummary(false);
  }, [filters.variant]);

  const loadList = useCallback(async () => {
    setLoadingList(true);
    setError(null);
    const status =
      filters.status !== 'All Status' ? (filters.status as StaffStatus) : undefined;
    const result = await fetchStaffDirectoryList({
      page: filters.page,
      limit: filters.pageSize,
      q: filters.q,
      status,
      role: filters.role,
      department: filters.department,
      hostel: filters.hostel,
      variant: filters.variant,
    });
    if (result.staff) {
      setStaff(result.staff);
      setTotal(result.total ?? result.staff.length);
    } else if (result.error) {
      setError(result.error);
      setStaff([]);
      setTotal(0);
    }
    setLoadingList(false);
  }, [filters]);

  useEffect(() => {
    void loadSummary();
    const interval = setInterval(() => {
      void loadSummary();
    }, 60_000);
    return () => clearInterval(interval);
  }, [loadSummary]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const refresh = useCallback(() => {
    void loadSummary();
    void loadList();
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
