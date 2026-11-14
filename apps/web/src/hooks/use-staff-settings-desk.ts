'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  fetchStaffSettingsDesk,
  patchStaffNotificationPreferences,
  type StaffSettingsDesk,
  type StaffSettingsSession,
} from '@/lib/api/dashboard';

const LIVE_POLL_MS = 20_000;

export function useStaffSettingsDesk() {
  const [desk, setDesk] = useState<StaffSettingsDesk | null>(null);
  const [sessions, setSessions] = useState<StaffSettingsSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setError(null);
    try {
      const result = await fetchStaffSettingsDesk();
      if (result.desk) {
        setDesk(result.desk);
        setSessions(result.sessions ?? []);
        setError(null);
      } else if (result.error) {
        setError(result.error);
      }
    } catch {
      setError('Unable to reach the API.');
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    void load();
    const interval = window.setInterval(() => {
      void load({ silent: true });
    }, LIVE_POLL_MS);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void load({ silent: true });
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [load]);

  const refresh = useCallback(() => {
    setLoading(true);
    void load();
  }, [load]);

  const updateNotification = useCallback(
    async (key: keyof StaffSettingsDesk['notifications'], value: boolean) => {
      setDesk((prev) =>
        prev ? { ...prev, notifications: { ...prev.notifications, [key]: value } } : prev,
      );
      const result = await patchStaffNotificationPreferences({ [key]: value });
      if (result.notifications) {
        setDesk((prev) => (prev ? { ...prev, notifications: result.notifications! } : prev));
      } else if (result.error) {
        setError(result.error);
        void load({ silent: true });
      }
    },
    [load],
  );

  return { desk, sessions, loading, error, refresh, updateNotification };
}