'use client';

import { useCallback, useEffect, useState } from 'react';

import type { StudentRecord, StudentStatus } from '@/components/dashboard/students/admin-students-data';
import {
  type StudentDirectorySummary,
  fetchStudentDirectoryList,
  fetchStudentDirectorySummary,
} from '@/lib/api/students';

export type StudentDirectoryFilters = {
  q: string;
  status: string;
  hostel: string;
  course: string;
  academicYear: string;
  page: number;
  pageSize: number;
};

type UseStudentDirectoryOptions = {
  pollIntervalMs?: number;
};

const DEFAULT_POLL_MS = 20_000;

export function useStudentDirectory(filters: StudentDirectoryFilters, options?: UseStudentDirectoryOptions) {
  const pollIntervalMs = options?.pollIntervalMs ?? DEFAULT_POLL_MS;
  const [summary, setSummary] = useState<StudentDirectorySummary | null>(null);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    const result = await fetchStudentDirectorySummary();
    if (result.summary) {
      setSummary(result.summary);
    } else if (result.error) {
      setError(result.error);
    }
    setLoadingSummary(false);
  }, []);

  const loadList = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) {
      setLoadingList(true);
    }
    setError(null);
    const status =
      filters.status !== 'All Status' ? (filters.status as StudentStatus) : undefined;
    const result = await fetchStudentDirectoryList({
      page: filters.page,
      limit: filters.pageSize,
      q: filters.q,
      status,
      hostel: filters.hostel,
      course: filters.course,
      academicYear: filters.academicYear,
    });
    if (result.students) {
      setStudents(result.students);
      setTotal(result.total ?? result.students.length);
      setLastSyncedAt(new Date().toISOString());
    } else if (result.error) {
      setError(result.error);
      setStudents([]);
      setTotal(0);
    }
    if (!opts?.silent) {
      setLoadingList(false);
    }
  }, [filters]);

  useEffect(() => {
    void loadSummary();
    const interval = window.setInterval(() => {
      void loadSummary();
    }, pollIntervalMs);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void loadSummary();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [loadSummary, pollIntervalMs]);

  useEffect(() => {
    void loadList();
    const interval = window.setInterval(() => {
      void loadList({ silent: true });
    }, pollIntervalMs);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void loadList({ silent: true });
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [loadList, pollIntervalMs]);

  const refresh = useCallback(() => {
    void loadSummary();
    void loadList();
  }, [loadList, loadSummary]);

  return {
    summary,
    students,
    total,
    loadingSummary,
    loadingList,
    error,
    refresh,
    lastSyncedAt,
  };
}
