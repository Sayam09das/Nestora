'use client';

import { useCallback, useEffect, useState } from 'react';

import { fetchCurrentUser } from '@/lib/api/auth';
import {
  type StudentDashboardOverview,
  fetchStudentDashboardOverview,
} from '@/lib/api/dashboard';

export type StudentDashboardSession = {
  displayName: string;
  overview: StudentDashboardOverview | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useStudentDashboardOverview(): StudentDashboardSession {
  const [displayName, setDisplayName] = useState('Student');
  const [overview, setOverview] = useState<StudentDashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [me, data] = await Promise.all([fetchCurrentUser(), fetchStudentDashboardOverview()]);
      if (me.user) {
        const name = me.user.firstName?.trim() || me.user.email.split('@')[0] || 'Student';
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
      void fetchStudentDashboardOverview().then((data) => {
        if (data.overview) setOverview(data.overview);
      });
    }, 20_000);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void fetchStudentDashboardOverview().then((data) => {
          if (data.overview) setOverview(data.overview);
        });
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [load]);

  return { displayName, overview, loading, error, refresh: load };
}
