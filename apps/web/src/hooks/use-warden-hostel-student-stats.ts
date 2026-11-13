'use client';

import { useCallback, useEffect, useState } from 'react';

import { fetchStudentDirectoryList } from '@/lib/api/students';

const LIVE_POLL_MS = 20_000;

export type WardenHostelStudentStats = {
  total: number;
  active: number;
  pending: number;
  inactive: number;
};

export function useWardenHostelStudentStats(hostelNameFilter: string) {
  const [stats, setStats] = useState<WardenHostelStudentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const hostel =
    hostelNameFilter && hostelNameFilter !== 'All Hostels' && hostelNameFilter !== 'No hostel assigned'
      ? hostelNameFilter
      : undefined;

  const load = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoading(true);
      }
      setError(null);
      if (!hostel) {
        setStats({ total: 0, active: 0, pending: 0, inactive: 0 });
        setLoading(false);
        return;
      }
      const base = { page: 1, limit: 1, hostel };
      const [all, active, pending, inactive] = await Promise.all([
        fetchStudentDirectoryList(base),
        fetchStudentDirectoryList({ ...base, status: 'Active' }),
        fetchStudentDirectoryList({ ...base, status: 'Pending' }),
        fetchStudentDirectoryList({ ...base, status: 'Inactive' }),
      ]);
      if (all.error ?? active.error ?? pending.error ?? inactive.error) {
        setError(all.error ?? active.error ?? pending.error ?? inactive.error ?? 'Unable to load hostel stats.');
        if (!silent) {
          setStats(null);
        }
      } else {
        setStats({
          total: all.total ?? 0,
          active: active.total ?? 0,
          pending: pending.total ?? 0,
          inactive: inactive.total ?? 0,
        });
        setLastSyncedAt(new Date().toISOString());
      }
      setLoading(false);
    },
    [hostel],
  );

  useEffect(() => {
    void load(false);
    const interval = window.setInterval(() => {
      void load(true);
    }, LIVE_POLL_MS);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void load(true);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [load]);

  return { stats, loading, error, lastSyncedAt, refresh: () => load(false) };
}
