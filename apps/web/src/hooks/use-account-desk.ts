'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  fetchAccountDesk,
  type AccountDeskPayload,
} from '@/lib/api/account';

type Options = { pollIntervalMs?: number };

export function useAccountDesk(options?: Options) {
  const pollIntervalMs = options?.pollIntervalMs ?? 20_000;
  const [desk, setDesk] = useState<AccountDeskPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    const result = await fetchAccountDesk();
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

  const mergeProfile = useCallback((profile: AccountDeskPayload['profile']) => {
    setDesk((prev) => (prev ? { ...prev, profile, generatedAt: new Date().toISOString() } : prev));
  }, []);

  return { desk, loading, error, refresh, mergeProfile };
}
