'use client';

import { useCallback, useEffect, useState } from 'react';

import { fetchCurrentUser } from '@/lib/api/auth';
import {
  type AdminDashboardOverview,
  fetchAdminDashboardOverview,
} from '@/lib/api/dashboard';

export type AdminDashboardSession = {
  displayName: string;
  overview: AdminDashboardOverview | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useAdminDashboardOverview(): AdminDashboardSession {
  const [displayName, setDisplayName] = useState('Admin');
  const [overview, setOverview] = useState<AdminDashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [me, data] = await Promise.all([fetchCurrentUser(), fetchAdminDashboardOverview()]);
      if (me.user) {
        const name = me.user.firstName?.trim() || me.user.email.split('@')[0] || 'Admin';
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
  }, []);

  useEffect(() => {
    void load();
    const interval = setInterval(() => {
      void fetchAdminDashboardOverview().then((data) => {
        if (data.overview) {
          setOverview(data.overview);
        }
      });
    }, 60_000);
    return () => clearInterval(interval);
  }, [load]);

  return { displayName, overview, loading, error, refresh: load };
}
