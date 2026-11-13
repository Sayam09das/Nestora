'use client';

import { useCallback, useEffect, useState } from 'react';

import type {
  AttendanceRosterRow,
  AttendanceSession,
} from '@/components/dashboard/attendance/admin-attendance-data';
import {
  clearNightAttendanceMark,
  fetchNightAttendanceSession,
  patchNightAttendanceMark,
  type NightAttendanceSummary,
} from '@/lib/api/attendance';

type UseNightAttendanceOptions = { pollIntervalMs?: number };

export function useNightAttendance(sessionDate: string, options?: UseNightAttendanceOptions) {
  const pollIntervalMs = options?.pollIntervalMs ?? 20_000;
  const [summary, setSummary] = useState<NightAttendanceSummary | null>(null);
  const [roster, setRoster] = useState<AttendanceRosterRow[]>([]);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) {
        setLoading(true);
      }
      const result = await fetchNightAttendanceSession(sessionDate);
      if (result.session) {
        setSummary(result.session.summary);
        setRoster(result.session.roster);
        setSessions(result.session.sessions);
        setError(null);
      } else if (result.error) {
        setError(result.error);
        if (!opts?.silent) {
          setSummary(null);
          setRoster([]);
          setSessions([]);
        }
      }
      if (!opts?.silent) {
        setLoading(false);
      }
    },
    [sessionDate],
  );

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load({ silent: true }), pollIntervalMs);
    return () => clearInterval(interval);
  }, [load, pollIntervalMs]);

  useEffect(() => {
    const onFocus = () => void load({ silent: true });
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [load]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        void load({ silent: true });
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [load]);

  const refresh = useCallback(() => {
    setLoading(true);
    void load();
  }, [load]);

  const applyMark = useCallback(
    async (studentId: string, mark: 'Present' | 'Absent' | 'On Leave' | 'Unmarked') => {
      if (mark === 'Unmarked') {
        const cleared = await clearNightAttendanceMark({ date: sessionDate, studentId });
        if (cleared.error) {
          return { ok: false as const, error: cleared.error };
        }
        void load({ silent: true });
        return { ok: true as const };
      }
      const result = await patchNightAttendanceMark({ date: sessionDate, studentId, mark });
      if (result.row) {
        setRoster((prev) => prev.map((r) => (r.id === studentId ? result.row! : r)));
        void load({ silent: true });
        return { ok: true as const };
      }
      return { ok: false as const, error: result.error ?? 'Could not save mark.' };
    },
    [sessionDate, load],
  );

  return {
    summary,
    roster,
    sessions,
    loading,
    error,
    refresh,
    applyMark,
  };
}
