'use client';

import { useCallback, useEffect, useState } from 'react';

import { fetchCurrentUser } from '@/lib/api/auth';
import {
  type OperationalDashboardOverview,
  fetchStaffDashboardOverview,
  fetchWardenDashboardOverview,
} from '@/lib/api/dashboard';

export type OperationalRole = 'HOSTEL_WARDEN' | 'HOSTEL_STAFF';

export type OperationalDashboardSession = {
  displayName: string;
  overview: OperationalDashboardOverview | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useOperationalDashboardOverview(role: OperationalRole): OperationalDashboardSession {
  const [displayName, setDisplayName] = useState(role === 'HOSTEL_WARDEN' ? 'Warden' : 'Staff');
  const [overview, setOverview] = useState<OperationalDashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = role === 'HOSTEL_WARDEN' ? fetchWardenDashboardOverview : fetchStaffDashboardOverview;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [me, data] = await Promise.all([fetchCurrentUser(), fetchOverview()]);
      if (me.user) {
        const name = me.user.firstName?.trim() || me.user.email.split('@')[0] || displayName;
        setDisplayName(name);
      } else if (me.error) {
        setError(me.error);
      }
      if (data.overview) {
        setOverview(data.overview);
      } else if (data.error) {
        setError((prev) => prev ?? data.error ?? 'Unable to load dashboard metrics.');
      }
    } catch {
      setError('Unable to reach the API.');
    } finally {
      setLoading(false);
    }
  }, [fetchOverview]);

  useEffect(() => {
    void load();
    const interval = setInterval(() => {
      void fetchOverview().then((data) => {
        if (data.overview) setOverview(data.overview);
      });
    }, 60_000);
    return () => clearInterval(interval);
  }, [load, fetchOverview]);

  return { displayName, overview, loading, error, refresh: load };
}
