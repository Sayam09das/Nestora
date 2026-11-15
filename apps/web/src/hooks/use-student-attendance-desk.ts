'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  fetchStudentAttendanceDesk,
  type StudentAttendanceDesk,
} from '@/lib/api/student-attendance';

type Options = { pollIntervalMs?: number; month?: string };

export function useStudentAttendanceDesk(options?: Options) {
  const pollIntervalMs = options?.pollIntervalMs ?? 20_000;
  const month = options?.month;
  const [desk, setDesk] = useState<StudentAttendanceDesk | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) setLoading(true);
      else setIsRefreshing(true);
      setError(null);
      const result = await fetchStudentAttendanceDesk(month);
      if (result.desk) {
        setDesk(result.desk);
        setError(null);
      } else if (result.error) {
        setError(result.error);
        if (!opts?.silent) setDesk(null);
      }
      if (!opts?.silent) setLoading(false);
      else setIsRefreshing(false);
    },
    [month],
  );

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load({ silent: true }), pollIntervalMs);
    return () => clearInterval(interval);
  }, [load, pollIntervalMs]);

  useEffect(() => {
    const refresh = () => void load({ silent: true });
    window.addEventListener('focus', refresh);
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [load]);

  const refresh = useCallback(() => {
    setLoading(true);
    void load();
  }, [load]);

  return { desk, loading, error, refresh, isRefreshing };
}