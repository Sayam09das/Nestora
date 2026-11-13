'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { fetchCurrentUser } from '@/lib/api/auth';
import {
  type OperationalDashboardOverview,
  fetchStaffDashboardOverview,
  fetchWardenDashboardOverview,
} from '@/lib/api/dashboard';

export type OperationalRole = 'HOSTEL_WARDEN' | 'HOSTEL_STAFF';

const LIVE_POLL_MS = 20_000;

export type OperationalDashboardSession = {
  displayName: string;
  overview: OperationalDashboardOverview | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export type UseOperationalDashboardOptions = {
  /** When set, metrics are scoped to this assigned hostel (warden only). */
  hostelId?: string;
};

export function useOperationalDashboardOverview(
  role: OperationalRole,
  options?: UseOperationalDashboardOptions,
): OperationalDashboardSession {
  const hostelId = options?.hostelId?.trim() || undefined;
  const [displayName, setDisplayName] = useState(role === 'HOSTEL_WARDEN' ? 'Warden' : 'Staff');
  const [overview, setOverview] = useState<OperationalDashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedUser = useRef(false);

  const fetchOverview = useCallback(() => {
    if (role === 'HOSTEL_WARDEN') {
      return fetchWardenDashboardOverview(hostelId ? { hostelId } : undefined);
    }
    return fetchStaffDashboardOverview();
  }, [role, hostelId]);

  const applyOverview = useCallback((data: Awaited<ReturnType<typeof fetchOverview>>) => {
    if (data.overview) {
      setOverview(data.overview);
      setError(null);
    } else if (data.error) {
      setError(data.error);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const tasks: [Promise<Awaited<ReturnType<typeof fetchCurrentUser>>>, Promise<Awaited<ReturnType<typeof fetchOverview>>>] =
        [
          hasLoadedUser.current ? Promise.resolve({ status: 200 }) : fetchCurrentUser(),
          fetchOverview(),
        ];
      const [me, data] = await Promise.all(tasks);
      if (me.user) {
        const name = me.user.firstName?.trim() || me.user.email.split('@')[0] || displayName;
        setDisplayName(name);
        hasLoadedUser.current = true;
      } else if (me.error && !hasLoadedUser.current) {
        setError(me.error);
      }
      applyOverview(data);
    } catch {
      setError('Unable to reach the API.');
    } finally {
      setLoading(false);
    }
  }, [applyOverview, displayName, fetchOverview]);

  const loadSilent = useCallback(async () => {
    try {
      const data = await fetchOverview();
      applyOverview(data);
    } catch {
      // keep last good snapshot during background refresh
    }
  }, [applyOverview, fetchOverview]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void loadSilent();
    }, LIVE_POLL_MS);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void loadSilent();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [loadSilent]);

  return { displayName, overview, loading, error, refresh: load };
}
