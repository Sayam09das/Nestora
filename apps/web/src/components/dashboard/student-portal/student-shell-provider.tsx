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
  type StudentNavBadgeKey,
  type StudentNavPermission,
} from '@/components/dashboard/student-portal/student-nav-permissions';
import { STUDENT_DEMO_ID } from '@/components/dashboard/student-portal/student-topbar-data';
import { fetchCurrentUser } from '@/lib/api/auth';
import { fetchStudentDashboardOverview } from '@/lib/api/dashboard';

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
  navPermissions: ReadonlySet<StudentNavPermission>;
  navBadges: StudentNavBadgeCounts;
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

      const overview = overviewRes.overview;
      if (!overview) return;

      if (overview.profile.registrationNumber) {
        setStudentId(overview.profile.registrationNumber);
      }
      if (overview.residence.hostelName) {
        setHostelName(overview.residence.hostelName);
      } else {
        setHostelName('No hostel assigned');
      }
      if (overview.residence.roomNumber && overview.residence.bedNumber) {
        setRoomLabel(
          `Room ${overview.residence.roomNumber} · Bed ${overview.residence.bedNumber}`,
        );
      } else {
        setRoomLabel('Room not assigned');
      }
      setNavBadges(overview.navBadges);
    };

    void sync();
    const interval = setInterval(() => {
      void fetchStudentDashboardOverview().then((res) => {
        if (cancelled || !res.overview) return;
        setNavBadges(res.overview.navBadges);
      });
    }, 60_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

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
      navPermissions,
      navBadges,
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
      navPermissions,
      navBadges,
    ],
  );

  return <StudentShellContext.Provider value={value}>{children}</StudentShellContext.Provider>;
}

export function useStudentShell(): StudentShellContextValue {
  const ctx = useContext(StudentShellContext);
  if (!ctx) throw new Error('useStudentShell must be used within StudentShellProvider');
  return ctx;
}
