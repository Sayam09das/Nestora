'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  fetchStudentSettingsDesk,
  patchStudentNotificationPreferences,
  type StudentSettingsDesk,
  type StudentSettingsSession,
} from '@/lib/api/student-settings';

const LIVE_POLL_MS = 20_000;

export function useStudentSettingsDesk() {
  const [desk, setDesk] = useState<StudentSettingsDesk | null>(null);
  const [sessions, setSessions] = useState<StudentSettingsSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    else setIsRefreshing(true);
    setError(null);
    try {
      const result = await fetchStudentSettingsDesk();
      if (result.desk) {
        setDesk(result.desk);
        setSessions(result.sessions ?? []);
      } else if (result.error) {
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
    const interval = window.setInterval(() => void load({ silent: true }), LIVE_POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void load({ silent: true });
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [load]);

  const refresh = useCallback(() => {
    setLoading(true);
    void load();
  }, [load]);

  const updateNotification = useCallback(
    async (key: keyof StudentSettingsDesk['notifications'], value: boolean) => {
      setDesk((prev) =>
        prev ? { ...prev, notifications: { ...prev.notifications, [key]: value } } : prev,
      );
      const result = await patchStudentNotificationPreferences({ [key]: value });
      if (result.notifications) {
        setDesk((prev) => (prev ? { ...prev, notifications: result.notifications! } : prev));
      } else if (result.error) {
        setError(result.error);
        void load({ silent: true });
      }
    },
    [load],
  );

  return { desk, sessions, loading, error, isRefreshing, refresh, updateNotification };
}