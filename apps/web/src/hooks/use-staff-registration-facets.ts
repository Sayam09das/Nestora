'use client';

import { useCallback, useEffect, useState } from 'react';

import { fetchStaffDirectoryList, fetchStaffDirectorySummary } from '@/lib/api/staff';

export function useStaffRegistrationFacets() {
  const [hostelOptions, setHostelOptions] = useState<string[]>(['All Hostels', 'Central Office']);
  const [managerOptions, setManagerOptions] = useState<string[]>(['None']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [summary, list] = await Promise.all([
      fetchStaffDirectorySummary('all'),
      fetchStaffDirectoryList({ page: 1, limit: 100, variant: 'all' }),
    ]);

    if (summary.summary?.facets.hostels) {
      const names = summary.summary.facets.hostels.filter(
        (h) => h !== 'Central Office' && h.trim().length > 0,
      );
      setHostelOptions(['All Hostels', 'Central Office', ...names]);
    }

    if (list.staff?.length) {
      const names = [...new Set(list.staff.map((row) => row.name.trim()).filter(Boolean))].sort();
      setManagerOptions(['None', ...names]);
    }

    if (summary.error && !summary.summary) {
      setError(summary.error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
    const interval = window.setInterval(() => {
      void load();
    }, 20_000);
    return () => window.clearInterval(interval);
  }, [load]);

  return { hostelOptions, managerOptions, loading, error, refresh: load };
}
