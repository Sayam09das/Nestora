'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  fetchGuardGateConsoleDesk,
  lookupGuardGatePass,
  recordGuardGateExit,
  recordGuardGateReturn,
  type GuardGateConsoleDesk,
  type GuardGateLookupResult,
} from '@/lib/api/guard-gate';

const SYNC_INTERVAL_MS = 20_000;

export function useGuardGateConsole() {
  const [desk, setDesk] = useState<GuardGateConsoleDesk | null>(null);
  const [lookup, setLookup] = useState<GuardGateLookupResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDesk = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    else setIsRefreshing(true);
    try {
      const result = await fetchGuardGateConsoleDesk();
      if (result.desk) setDesk(result.desk);
      else if (result.error && !opts?.silent) setError(result.error);
    } catch {
      if (!opts?.silent) setError('Unable to reach the API.');
    } finally {
      if (!opts?.silent) setLoading(false);
      else setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadDesk();
    const interval = setInterval(() => void loadDesk({ silent: true }), SYNC_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void loadDesk({ silent: true });
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [loadDesk]);

  const runLookup = useCallback(async (token: string) => {
    setActionLoading(true);
    setError(null);
    try {
      const result = await lookupGuardGatePass(token);
      if (result.result) {
        setLookup(result.result);
        return true;
      }
      setError(result.error ?? 'Lookup failed.');
      setLookup(null);
      return false;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const runExit = useCallback(
    async (passId: string, remarks?: string) => {
      setActionLoading(true);
      setError(null);
      try {
        const result = await recordGuardGateExit(passId, remarks);
        if (result.result) {
          setLookup(result.result);
          await loadDesk({ silent: true });
          return true;
        }
        setError(result.error ?? 'Could not record exit.');
        return false;
      } finally {
        setActionLoading(false);
      }
    },
    [loadDesk],
  );

  const runReturn = useCallback(
    async (passId: string, remarks?: string) => {
      setActionLoading(true);
      setError(null);
      try {
        const result = await recordGuardGateReturn(passId, remarks);
        if (result.result) {
          setLookup(result.result);
          await loadDesk({ silent: true });
          return true;
        }
        setError(result.error ?? 'Could not record return.');
        return false;
      } finally {
        setActionLoading(false);
      }
    },
    [loadDesk],
  );

  const clearLookup = useCallback(() => {
    setLookup(null);
    setError(null);
  }, []);

  const refresh = useCallback(() => {
    void loadDesk();
  }, [loadDesk]);

  return {
    desk,
    lookup,
    loading,
    actionLoading,
    error,
    isRefreshing,
    refresh,
    runLookup,
    runExit,
    runReturn,
    clearLookup,
  };
}