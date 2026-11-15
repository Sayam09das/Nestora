'use client';

import { useCallback, useEffect, useState } from 'react';

import { fetchStudentProfileDesk, type StudentSelfProfileDesk } from '@/lib/api/student-profile';

type Options = { pollIntervalMs?: number };

export function useStudentProfileDesk(options?: Options) {
  const pollIntervalMs = options?.pollIntervalMs ?? 20_000;
  const [desk, setDesk] = useState<StudentSelfProfileDesk | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    const result = await fetchStudentProfileDesk();
    if (result.desk) {
      setDesk(result.desk);
      setError(null);
    } else if (result.error) {
      setError(result.error);
      if (!opts?.silent) setDesk(null);
    }
    if (!opts?.silent) setLoading(false);
  }, []);

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

  const mergeDesk = useCallback((next: StudentSelfProfileDesk) => {
    setDesk(next);
    setError(null);
  }, []);

  return { desk, loading, error, refresh, mergeDesk };
}