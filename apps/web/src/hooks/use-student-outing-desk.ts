'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  fetchStudentOutingDesk,
  type StudentOutingDesk,
} from '@/lib/api/student-outings';

export function useStudentOutingDesk(pollIntervalMs = 20_000) {
  const [desk, setDesk] = useState<StudentOutingDesk | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    else setIsRefreshing(true);
    const result = await fetchStudentOutingDesk();
    if (result.desk) {
      setDesk(result.desk);
      setError(null);
    } else if (result.error) {
      setError(result.error);
    }
    if (!opts?.silent) setLoading(false);
    else setIsRefreshing(false);
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load({ silent: true }), pollIntervalMs);
    return () => window.clearInterval(id);
  }, [load, pollIntervalMs]);

  const mergeDesk = useCallback((next: StudentOutingDesk) => {
    setDesk(next);
  }, []);

  return { desk, loading, error, isRefreshing, refresh: () => load({ silent: true }), mergeDesk };
}