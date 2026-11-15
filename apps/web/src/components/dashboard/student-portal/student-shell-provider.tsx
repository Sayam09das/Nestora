'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  createStudentNavPermissions,
  readStudentFeesOnlineEnabled,
  STUDENT_FEES_ONLINE_STORAGE_KEY,
  type StudentNavBadgeKey,
  type StudentNavPermission,
} from '@/components/dashboard/student-portal/student-nav-permissions';
import { STUDENT_DEMO_ID } from '@/components/dashboard/student-portal/student-topbar-data';
import { fetchCurrentUser } from '@/lib/api/auth';
import { fetchStudentDashboardOverview, type StudentDashboardOverview } from '@/lib/api/dashboard';

export type StudentNavBadgeCounts = Record<StudentNavBadgeKey, number>;

const EMPTY_NAV_BADGES: StudentNavBadgeCounts = {
  leave: 0,
  complaints: 0,
  maintenance: 0,
  fees: 0,
  announcements: 0,
  visitors: 0,
};

const STORAGE_KEY = 'nestora-student-sidebar-collapsed';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]?.[0] ?? ''}${parts[parts.length - 1]?.[0] ?? ''}`.toUpperCase();
  return name.slice(0, 2).toUpperCase() || 'ST';
}

type StudentShellContextValue = {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (value: boolean) => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (value: boolean) => void;
  toggleMobileNav: () => void;
  displayName: string;
  studentId: string;
  initials: string;
  hostelName: string;
  roomLabel: string;
  feesOnlineEnabled: boolean;
  setFeesOnlineEnabled: (value: boolean) => void;
  navPermissions: ReadonlySet<StudentNavPermission>;
  navBadges: StudentNavBadgeCounts;
  syncFromOverview: (overview: StudentDashboardOverview) => void;
};

const StudentShellContext = createContext<StudentShellContextValue | null>(null);

export function StudentShellProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [displayName, setDisplayName] = useState('Student');
  const [studentId, setStudentId] = useState(STUDENT_DEMO_ID);
  const [hostelName, setHostelName] = useState('Your hostel');
  const [roomLabel, setRoomLabel] = useState('Room not assigned');
  const [navBadges, setNavBadges] = useState<StudentNavBadgeCounts>(EMPTY_NAV_BADGES);
  const [feesOnlineEnabled, setFeesOnlineEnabled] = useState(true);

  const applyOverview = useCallback((overview: StudentDashboardOverview) => {
    if (overview.profile.registrationNumber) {
      setStudentId(overview.profile.registrationNumber);
    }
    if (overview.residence.hostelName) {
      setHostelName(overview.residence.hostelName);
    } else {
      setHostelName('No hostel assigned');
    }
    if (overview.residence.roomNumber && overview.residence.bedNumber) {
      setRoomLabel(`Room ${overview.residence.roomNumber} · Bed ${overview.residence.bedNumber}`);
    } else {
      setRoomLabel('Room not assigned');
    }
    setNavBadges(overview.navBadges);
  }, []);

  const syncFromOverview = useCallback(
    (overview: StudentDashboardOverview) => {
      applyOverview(overview);
    },
    [applyOverview],
  );

  useEffect(() => {
    setHydrated(true);
    try {
      setSidebarCollapsed(localStorage.getItem(STORAGE_KEY) === '1');
      setFeesOnlineEnabled(readStudentFeesOnlineEnabled());
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const sync = async () => {
      const [{ user }, overviewRes] = await Promise.all([
        fetchCurrentUser(),
        fetchStudentDashboardOverview(),
      ]);
      if (cancelled) return;

      if (user) {
        const name = `${user.firstName} ${user.lastName}`.trim() || 'Student';
        setDisplayName(name);
      }

      if (overviewRes.overview) {
        applyOverview(overviewRes.overview);
      }
    };

    void sync();

    return () => {
      cancelled = true;
    };
  }, [applyOverview]);

  const setSidebarCollapsedPersisted = useCallback((value: boolean) => {
    setSidebarCollapsed(value);
    try {
      localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
    } catch {
      // ignore
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((current) => {
      const next = !current;
      try {
        localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const toggleMobileNav = useCallback(() => {
    setMobileNavOpen((open) => !open);
  }, []);

  const setFeesOnlineEnabledPersisted = useCallback((value: boolean) => {
    setFeesOnlineEnabled(value);
    try {
      localStorage.setItem(STUDENT_FEES_ONLINE_STORAGE_KEY, value ? '1' : '0');
    } catch {
      // ignore
    }
  }, []);

  const initials = useMemo(() => getInitials(displayName), [displayName]);

  const navPermissions = useMemo(
    () => createStudentNavPermissions(feesOnlineEnabled),
    [feesOnlineEnabled],
  );

  const value = useMemo(
    () => ({
      sidebarCollapsed: hydrated ? sidebarCollapsed : false,
      toggleSidebar,
      setSidebarCollapsed: setSidebarCollapsedPersisted,
      mobileNavOpen,
      setMobileNavOpen,
      toggleMobileNav,
      displayName,
      studentId,
      initials,
      hostelName,
      roomLabel,
      feesOnlineEnabled,
      setFeesOnlineEnabled: setFeesOnlineEnabledPersisted,
      navPermissions,
      navBadges,
      syncFromOverview,
    }),
    [
      hydrated,
      sidebarCollapsed,
      toggleSidebar,
      setSidebarCollapsedPersisted,
      mobileNavOpen,
      toggleMobileNav,
      displayName,
      studentId,
      initials,
      hostelName,
      roomLabel,
      feesOnlineEnabled,
      setFeesOnlineEnabledPersisted,
      navPermissions,
      navBadges,
      syncFromOverview,
    ],
  );

  return <StudentShellContext.Provider value={value}>{children}</StudentShellContext.Provider>;
}

export function useStudentShell(): StudentShellContextValue {
  const ctx = useContext(StudentShellContext);
  if (!ctx) throw new Error('useStudentShell must be used within StudentShellProvider');
  return ctx;
}
