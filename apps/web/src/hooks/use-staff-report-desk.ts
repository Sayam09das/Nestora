'use client';

import { useCallback, useEffect, useState } from 'react';

import { fetchStaffReportDesk, type StaffReportDesk } from '@/lib/api/dashboard';

const LIVE_POLL_MS = 20_000;

export function useStaffReportDesk() {
  const [desk, setDesk] = useState<StaffReportDesk | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const result = await fetchStaffReportDesk();
      if (result.desk) {
        setDesk(result.desk);
      } else if (result.error) {
        setError(result.error);
      }
    } catch {
      setError('Unable to reach the API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    void load();
    const interval = window.setInterval(() => {
      void load();
    }, LIVE_POLL_MS);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void load();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [load]);

  return { desk, loading, error, refresh: load };
}