'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { StudentRoommatesSnapshot } from '@/components/dashboard/student-portal/roommates/student-roommates-data';
import {
  emptyStudentRoommatesSnapshot,
  mapOverviewToRoommatesSnapshot,
} from '@/components/dashboard/student-portal/roommates/student-roommates-mapper';
import { fetchCurrentUser } from '@/lib/api/auth';
import { fetchStudentDashboardOverview } from '@/lib/api/dashboard';

const SYNC_INTERVAL_MS = 20_000;

export function useStudentRoommatesLive(displayName: string) {
  const [snapshot, setSnapshot] = useState<StudentRoommatesSnapshot>(emptyStudentRoommatesSnapshot);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const displayNameRef = useRef(displayName);

  useEffect(() => {
    displayNameRef.current = displayName;
  }, [displayName]);

  const refresh = useCallback(async () => {
    if (!mountedRef.current) return;
    setIsRefreshing(true);
    setSyncError(null);

    let name = displayNameRef.current;

    try {
      const [me, data] = await Promise.all([fetchCurrentUser(), fetchStudentDashboardOverview()]);
      if (me.user) {
        name = `${me.user.firstName} ${me.user.lastName}`.trim() || name;
      }

      if (!mountedRef.current) return;

      if (data.overview) {
        setSnapshot(mapOverviewToRoommatesSnapshot(data.overview, name));
        setLastSyncedAt(new Date(data.overview.generatedAt));
      } else if (data.error) {
        setSyncError(data.error);
      }
    } catch {
      if (mountedRef.current) {
        setSyncError('Unable to reach the API.');
      }
    } finally {
      if (mountedRef.current) {
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void refresh();
    const intervalId = window.setInterval(() => {
      void refresh();
    }, SYNC_INTERVAL_MS);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void refresh();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      mountedRef.current = false;
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [refresh]);

  return { snapshot, lastSyncedAt, isRefreshing, refresh, syncError };
}
