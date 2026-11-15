'use client';

import { useCallback, useEffect, useState } from 'react';

import { fetchStudentVisitorDesk, type StudentVisitorDesk } from '@/lib/api/student-visitors';

const SYNC_INTERVAL_MS = 20_000;

export function useStudentVisitorsDesk() {
  const [desk, setDesk] = useState<StudentVisitorDesk | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    else setIsRefreshing(true);
    setError(null);
    try {
      const result = await fetchStudentVisitorDesk();
      if (result.desk) setDesk(result.desk);
      else if (result.error) {
        setError(result.error);
        if (!opts?.silent) setDesk(null);
      }
    } catch {
      setError('Unable to reach the API.');
    } finally {
      if (!opts?.silent) setLoading(false);
      else setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load({ silent: true }), SYNC_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void load({ silent: true });
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [load]);

  const refresh = useCallback(() => {
    setLoading(true);
    void load();
  }, [load]);

  return { desk, loading, error, isRefreshing, refresh, mergeDesk: setDesk };
}