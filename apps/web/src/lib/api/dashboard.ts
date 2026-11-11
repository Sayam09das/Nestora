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

export type StudentDashboardOverview = {
  generatedAt: string;
  profile: {
    linked: boolean;
    studentId: string | null;
    registrationNumber: string | null;
    department: string | null;
    course: string | null;
    academicYear: string | null;
    currentSemester: string | null;
    admissionYear: string | null;
  };
  residence: {
    hasActiveAllocation: boolean;
    hostelName: string | null;
    roomNumber: string | null;
    bedNumber: string | null;
    blockName: string | null;
    floorLabel: string | null;
    capacity: number | null;
    roomStatus: 'occupied' | 'vacant';
    allocationRecordId: string | null;
    allocationRef: string | null;
    allocationStartDate: string | null;
    academicYear: string | null;
    roomTypeLabel: string | null;
    occupiedBeds: number | null;
    availableBeds: number | null;
    facilitiesSummary: string | null;
    hasAc: boolean | null;
  };
  roomRequests: Array<{
    id: string;
    type: 'room_change' | 'bed_change' | 'maintenance' | 'roommate_issue';
    typeLabel: string;
    submittedAt: string;
    description: string;
    status: 'pending' | 'approved' | 'rejected' | 'in_progress';
    statusLabel: string;
  }>;
  allocationHistory: Array<{
    id: string;
    academicYear: string;
    hostel: string;
    room: string;
    bed: string;
    status: 'Current' | 'Previous';
  }>;
  attendanceMonth: {
    label: string;
    percent: number | null;
    present: number;
    absent: number;
    onLeave: number;
    standing: string;
  };
  leave: {
    total: number;
    pending: number;
    approved: number;
    recent: Array<{
      id: string;
      title: string;
      status: 'pending' | 'approved' | 'rejected';
      dateRange: string;
      statusNote: string;
    }>;
  };
  fees: {
    available: boolean;
    outstanding: number;
    totalAssessed: number;
    totalPaid: number;
    dueDate: string | null;
  };
  complaints: Array<{
    id: string;
    title: string;
    location: string;
    status: 'in_progress' | 'resolved' | 'open';
    statusLabel: string;
  }>;
  announcements: Array<{
    id: string;
    title: string;
    relativeTime: string;
    body: string;
    author: string;
  }>;
  events: Array<{
    id: string;
    day: string;
    month: string;
    title: string;
    schedule: string;
  }>;
  roommates: Array<{
    id: string;
    name: string;
    program: string;
    initials: string;
    bedNumber: string | null;
    registrationNumber: string;
    department: string;
    course: string;
    academicYear: string;
    admissionYear: string;
    hostelName: string | null;
    roomNumber: string | null;
    blockName: string | null;
    floorLabel: string | null;
  }>;
  navBadges: {
    leave: number;
    complaints: number;
    maintenance: number;
    fees: number;
    announcements: number;
    visitors: number;
  };
};

export async function fetchStudentDashboardOverview(): Promise<{
  overview?: StudentDashboardOverview;
  error?: string;
}> {
  const response = await apiFetch('/api/v1/dashboard/student/overview');
  const parsed = await parseApiResponse<{ overview: StudentDashboardOverview }>(response);
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
