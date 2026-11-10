import { apiFetch } from '@/lib/api/client';
import { parseApiResponse } from '@/lib/api/parse-response';

export type AdminDashboardOverview = {
  generatedAt: string;
  occupancy: {
    percent: number | null;
    occupiedBeds: number;
    totalOperationalBeds: number;
    availableBeds: number;
  };
  pendingActivations: number;
  students: {
    active: number;
    createdThisMonth: number;
    createdPreviousMonth: number;
    monthOverMonthPercent: number | null;
  };
  staff: { active: number };
  infrastructure: {
    hostels: number;
    rooms: number;
    beds: number;
  };
  attendanceToday: {
    percent: number | null;
    present: number;
    absent: number;
    onLeave: number;
  };
  announcements: {
    liveCount: number;
    recent: Array<{ id: string; title: string; postedAt: string }>;
  };
  operations: {
    openComplaints: number;
    pendingLeave: number;
    avgResponseHours: number | null;
  };
  approvals: {
    studentRegistrations: number;
    leaveRequests: number;
    complaints: number;
    totalPending: number;
  };
  fees: {
    available: boolean;
    collectedInr: number | null;
    expectedInr: number | null;
    pendingInr: number | null;
    collectionRatePercent: number | null;
    monthlyTrend: Array<{ month: string; feesInr: number }>;
  };
  recentActivities: Array<{
    id: string;
    title: string;
    detail: string;
    occurredAt: string;
    entityType: string;
    actionName: string;
  }>;
};

export async function fetchAdminDashboardOverview(): Promise<{
  overview?: AdminDashboardOverview;
  error?: string;
}> {
  const response = await apiFetch('/api/v1/dashboard/admin/overview');
  const parsed = await parseApiResponse<{ overview: AdminDashboardOverview }>(response);
  if (!parsed.ok) {
    return { error: parsed.message };
  }
  return { overview: parsed.data.overview };
}

export type OperationalDashboardOverview = {
  generatedAt: string;
  role: 'HOSTEL_WARDEN' | 'HOSTEL_STAFF';
  scope: {
    hostelNames: string[];
    unassigned: boolean;
  };
  occupancy: {
    percent: number | null;
    occupiedBeds: number;
    availableBeds: number;
    totalOperationalBeds: number;
  };
  residents: { activeAllocations: number };
  attendanceToday: {
    percent: number | null;
    present: number;
    absent: number;
    onLeave: number;
  };
  operations: {
    openComplaints: number;
    pendingLeave: number;
    myAssignedTickets: number;
    dutiesToday: number;
  };
  approvals: {
    pendingAdmissions: number;
    leaveRequests: number;
    complaints: number;
    totalPending: number;
  };
};

export async function fetchWardenDashboardOverview(): Promise<{
  overview?: OperationalDashboardOverview;
  error?: string;
}> {
  const response = await apiFetch('/api/v1/dashboard/warden/overview');
  const parsed = await parseApiResponse<{ overview: OperationalDashboardOverview }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { overview: parsed.data.overview };
}

export async function fetchStaffDashboardOverview(): Promise<{
  overview?: OperationalDashboardOverview;
  error?: string;
}> {
  const response = await apiFetch('/api/v1/dashboard/staff/overview');
  const parsed = await parseApiResponse<{ overview: OperationalDashboardOverview }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { overview: parsed.data.overview };
}

export async function fetchApiReadiness(): Promise<'ready' | 'degraded' | 'unknown'> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
    if (!base) {
      return 'unknown';
    }
    const response = await fetch(`${base}/health/ready`, { credentials: 'omit' });
    if (response.ok) {
      return 'ready';
    }
    return 'degraded';
  } catch {
    return 'unknown';
  }
}
