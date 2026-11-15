'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { useStudentTopbarLive } from '@/hooks/use-student-topbar-live';

type StudentTopbarLiveContextValue = ReturnType<typeof useStudentTopbarLive>;

const StudentTopbarLiveContext = createContext<StudentTopbarLiveContextValue | null>(null);

export function StudentTopbarLiveProvider({ children }: { children: ReactNode }) {
  const live = useStudentTopbarLive();
  const value = useMemo(() => live, [live]);

  return <StudentTopbarLiveContext.Provider value={value}>{children}</StudentTopbarLiveContext.Provider>;
}

export function useStudentTopbarLiveContext() {
  const context = useContext(StudentTopbarLiveContext);
  if (!context) {
    throw new Error('useStudentTopbarLiveContext must be used within StudentTopbarLiveProvider.');
  }
  return context;
}