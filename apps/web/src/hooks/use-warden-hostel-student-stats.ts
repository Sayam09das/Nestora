'use client';

import { useCallback, useEffect, useState } from 'react';

import { fetchStudentDirectoryList } from '@/lib/api/students';

export type WardenHostelStudentStats = {
  total: number;
  active: number;
  pending: number;
  inactive: number;
};

export function useWardenHostelStudentStats(hostelApiFilter: string) {
  const [stats, setStats] = useState<WardenHostelStudentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const base = { page: 1, limit: 1, hostel: hostelApiFilter };
    const [all, active, pending, inactive] = await Promise.all([
      fetchStudentDirectoryList(base),
      fetchStudentDirectoryList({ ...base, status: 'Active' }),
      fetchStudentDirectoryList({ ...base, status: 'Pending' }),
      fetchStudentDirectoryList({ ...base, status: 'Inactive' }),
    ]);
    if (all.error ?? active.error ?? pending.error ?? inactive.error) {
      setError(all.error ?? active.error ?? pending.error ?? inactive.error ?? 'Unable to load hostel stats.');
      setStats(null);
    } else {
      setStats({
        total: all.total ?? 0,
        active: active.total ?? 0,
        pending: pending.total ?? 0,
        inactive: inactive.total ?? 0,
      });
    }
    setLoading(false);
  }, [hostelApiFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  return { stats, loading, error, refresh: load };
}
