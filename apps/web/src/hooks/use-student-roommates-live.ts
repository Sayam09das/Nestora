'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useStudentTopbarLiveContext } from '@/components/dashboard/student-portal/student-topbar-live-provider';
import {
  emptyStudentRoommatesSnapshot,
  mapOverviewToRoommatesSnapshot,
} from '@/components/dashboard/student-portal/roommates/student-roommates-mapper';
import type { StudentRoommatesSnapshot } from '@/components/dashboard/student-portal/roommates/student-roommates-data';
import type { StudentDashboardOverview } from '@/lib/api/dashboard';
import { fetchStudentRoommatesDesk } from '@/lib/api/student-roommates';

const SYNC_INTERVAL_MS = 20_000;

function mapDeskToOverviewSlice(
  desk: NonNullable<Awaited<ReturnType<typeof fetchStudentRoommatesDesk>>['desk']>,
): Pick<StudentDashboardOverview, 'profile' | 'residence' | 'roommates' | 'generatedAt'> {
  return {
    generatedAt: desk.generatedAt,
    profile: desk.profile,
    residence: desk.residence,
    roommates: desk.roommates,
  };
}

export function useStudentRoommatesLive(displayName: string) {
  const {
    latestOverview,
    loading: overviewLoading,
    error: overviewError,
    refresh: refreshOverview,
  } = useStudentTopbarLiveContext();

  const [deskSnapshot, setDeskSnapshot] = useState<StudentRoommatesSnapshot | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const snapshotFromOverview = useMemo(() => {
    if (!latestOverview) return null;
    return mapOverviewToRoommatesSnapshot(latestOverview, displayName);
  }, [latestOverview, displayName]);

  const loadDesk = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) setIsRefreshing(true);
      setSyncError(null);
      try {
        const result = await fetchStudentRoommatesDesk();
        if (result.desk) {
          const slice = mapDeskToOverviewSlice(result.desk);
          setDeskSnapshot(
            mapOverviewToRoommatesSnapshot({ ...slice } as StudentDashboardOverview, displayName),
          );
          setLastSyncedAt(new Date(result.desk.generatedAt));
        } else if (result.error) {
          setSyncError(result.error);
        }
      } catch {
        setSyncError('Unable to reach the API.');
      } finally {
        if (!opts?.silent) setIsRefreshing(false);
      }
    },
    [displayName],
  );

  useEffect(() => {
    void loadDesk();
    const intervalId = window.setInterval(() => {
      void loadDesk({ silent: true });
    }, SYNC_INTERVAL_MS);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void loadDesk({ silent: true });
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [loadDesk]);

  useEffect(() => {
    if (deskSnapshot || lastSyncedAt) return;
    if (latestOverview) {
      setLastSyncedAt(new Date(latestOverview.generatedAt));
    }
  }, [latestOverview, deskSnapshot, lastSyncedAt]);

  const snapshot = deskSnapshot ?? snapshotFromOverview ?? emptyStudentRoommatesSnapshot();
  const loading = !deskSnapshot && !snapshotFromOverview && (overviewLoading || isRefreshing);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([refreshOverview(), loadDesk({ silent: true })]);
    setIsRefreshing(false);
  }, [loadDesk, refreshOverview]);

  const error = syncError ?? overviewError;

  return { snapshot, lastSyncedAt, isRefreshing, loading, refresh, syncError: error };
}