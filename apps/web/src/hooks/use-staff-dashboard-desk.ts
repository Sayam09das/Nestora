'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import type { ComplaintTicket } from '@/components/dashboard/complaints/admin-complaints-data';
import type { AnnouncementRecord } from '@/components/dashboard/announcements/admin-announcements-data';
import {
  createEmptyStaffSnapshot,
  mergeStaffSnapshotWithLiveData,
  type StaffDashboardSnapshot,
} from '@/components/dashboard/staff-portal/home/staff-dashboard-data';
import type { StaffDutyRole } from '@/components/dashboard/staff-portal/staff-nav-permissions';
import type { StaffShiftDisplay } from '@/components/dashboard/staff-portal/staff-topbar-data';
import { fetchAnnouncementsDeskNotices } from '@/lib/api/announcements';
import { fetchComplaintsDeskTickets } from '@/lib/api/complaints';
import { fetchStaffDashboardOverview, type OperationalDashboardOverview } from '@/lib/api/dashboard';

const LIVE_POLL_MS = 20_000;

type Options = {
  dutyRole: StaffDutyRole;
  displayName: string;
  workplaceName: string;
  shift: StaffShiftDisplay;
};

export function useStaffDashboardDesk({ dutyRole, displayName, workplaceName, shift }: Options) {
  const [overview, setOverview] = useState<OperationalDashboardOverview | null>(null);
  const [tickets, setTickets] = useState<ComplaintTicket[]>([]);
  const [notices, setNotices] = useState<AnnouncementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hostelFilter =
    workplaceName && workplaceName !== 'Assigned hostel' && workplaceName !== 'No hostel assigned'
      ? workplaceName.split(' · ')[0]
      : undefined;

  const load = useCallback(async () => {
    setError(null);
    try {
      const [overviewRes, complaintsRes, noticesRes] = await Promise.all([
        fetchStaffDashboardOverview(),
        fetchComplaintsDeskTickets({ limit: 40, hostel: hostelFilter, status: 'All Status' }),
        fetchAnnouncementsDeskNotices({ limit: 10, status: 'Live' }),
      ]);

      if (overviewRes.overview) {
        setOverview(overviewRes.overview);
      } else if (overviewRes.error) {
        setError(overviewRes.error);
      }

      if (complaintsRes.tickets) {
        setTickets(complaintsRes.tickets);
      }
      if (noticesRes.notices) {
        setNotices(noticesRes.notices);
      }
    } catch {
      setError('Unable to reach the API.');
    } finally {
      setLoading(false);
    }
  }, [hostelFilter]);

  useEffect(() => {
    setLoading(true);
    void load();
    const interval = window.setInterval(() => {
      void load();
    }, LIVE_POLL_MS);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void load();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [load]);

  const snapshot = useMemo((): StaffDashboardSnapshot => {
    const base = createEmptyStaffSnapshot(dutyRole, workplaceName, shift);
    return mergeStaffSnapshotWithLiveData(base, overview, tickets, notices, displayName, shift);
  }, [dutyRole, displayName, notices, overview, shift, tickets, workplaceName]);

  return {
    snapshot,
    overview,
    tickets,
    loading,
    error,
    refresh: load,
  };
}