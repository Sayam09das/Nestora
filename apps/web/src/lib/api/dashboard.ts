import { apiFetch, apiFetchMutating } from '@/lib/api/client';
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

export type OperationalDashboardHostel = { id: string; name: string };

export type OperationalDashboardOverview = {
  generatedAt: string;
  role: 'HOSTEL_WARDEN' | 'HOSTEL_STAFF';
  hostels: OperationalDashboardHostel[];
  focusHostelId: string | null;
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
    pendingOutings: number;
    complaints: number;
    maintenancePipeline: number;
    totalPending: number;
  };
  panels: {
    admissionsQueue: Array<{
      id: string;
      name: string;
      registrationNo: string;
      course: string;
      submittedAt: string;
    }>;
    openIssues: Array<{
      id: string;
      issue: string;
      room: string;
      priority: 'High' | 'Medium' | 'Low';
      status: 'Open' | 'Assigned' | 'In progress';
    }>;
    visitorsToday: {
      total: number;
      checkedOut: number;
      inside: number;
      recent: Array<{
        id: string;
        name: string;
        visiting: string;
        room: string;
        time: string;
      }>;
    };
    activeIncidents: {
      count: number;
      items: Array<{
        id: string;
        title: string;
        severity: 'Critical' | 'High' | 'Medium';
        status: 'Open' | 'Acknowledged' | 'In progress';
        reportedAt: string;
      }>;
    };
  };
};

export async function fetchWardenDashboardOverview(options?: {
  hostelId?: string;
}): Promise<{
  overview?: OperationalDashboardOverview;
  error?: string;
}> {
  const query =
    options?.hostelId?.trim()
      ? `?hostelId=${encodeURIComponent(options.hostelId.trim())}`
      : '';
  const response = await apiFetch(`/api/v1/dashboard/warden/overview${query}`);
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

export type StaffScheduleEntry = {
  id: string;
  dutyDate: string;
  shiftType: string;
  shiftLabel: string;
  timeWindow: string;
  zone: string | null;
  hostelId: string;
  hostelName: string;
};

export type StaffDutySchedule = {
  generatedAt: string;
  from: string;
  to: string;
  entries: StaffScheduleEntry[];
  dutiesToday: number;
};

export type StaffAttendanceRecord = {
  id: string;
  workDate: string;
  status: 'PRESENT' | 'ABSENT' | 'ON_LEAVE';
  hostelName: string;
};

export type StaffAttendanceDesk = {
  generatedAt: string;
  from: string;
  to: string;
  summary: {
    present: number;
    absent: number;
    onLeave: number;
    total: number;
    percent: number | null;
  };
  today: {
    status: 'PRESENT' | 'ABSENT' | 'ON_LEAVE' | null;
    dutyScheduled: boolean;
    shiftLabel: string | null;
    shiftWindow: string | null;
    zone: string | null;
    hostelName: string | null;
  };
  records: StaffAttendanceRecord[];
  hostelStudentsToday: {
    present: number;
    absent: number;
    onLeave: number;
    percent: number | null;
  };
};

export async function fetchStaffAttendanceDesk(options?: {
  from?: string;
  to?: string;
}): Promise<{ desk?: StaffAttendanceDesk; error?: string }> {
  const params = new URLSearchParams();
  if (options?.from) params.set('from', options.from);
  if (options?.to) params.set('to', options.to);
  const qs = params.toString();
  const response = await apiFetch(`/api/v1/dashboard/staff/attendance${qs ? `?${qs}` : ''}`);
  const parsed = await parseApiResponse<{ desk: StaffAttendanceDesk }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { desk: parsed.data.desk };
}

export async function postStaffShiftCheckIn(): Promise<{ desk?: StaffAttendanceDesk; error?: string }> {
  const response = await apiFetch('/api/v1/dashboard/staff/attendance/check-in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const parsed = await parseApiResponse<{ desk: StaffAttendanceDesk }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { desk: parsed.data.desk };
}

export type StaffReportDesk = {
  generatedAt: string;
  hostelNames: string[];
  defaultHostelName: string | null;
  summary: {
    myOpen: number;
    myTotal: number;
    hostelActive: number;
  };
  records: import('@/components/dashboard/incidents/incident-desk-data').IncidentDeskRecord[];
};

export type StaffReportIncidentInput = {
  title: string;
  description: string;
  location: string;
  incidentType: import('@/components/dashboard/incidents/incident-desk-data').IncidentType;
  initialSeverity: import('@/components/dashboard/incidents/incident-desk-data').IncidentSeverity;
};

export async function fetchStaffReportDesk(): Promise<{ desk?: StaffReportDesk; error?: string }> {
  const response = await apiFetch('/api/v1/dashboard/staff/report');
  const parsed = await parseApiResponse<{ desk: StaffReportDesk }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { desk: parsed.data.desk };
}

export type StaffSettingsDesk = {
  generatedAt: string;
  security: {
    mfaEnabled: boolean;
    isVerified: boolean;
    mustChangePassword: boolean;
    email: string;
  };
  notifications: {
    emailLeaves: boolean;
    emailMaintenance: boolean;
    emailFees: boolean;
    emailNotices: boolean;
  };
  operations: {
    dutiesToday: number;
    myAssignedTickets: number;
    openComplaints: number;
  };
  scope: {
    hostelNames: string[];
    unassigned: boolean;
  };
};

export type StaffSettingsSession = {
  id: string;
  createdAt: string;
  lastActivityAt: string | null;
  expiresAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  isCurrent: boolean;
};

export async function fetchStaffSettingsDesk(): Promise<{
  desk?: StaffSettingsDesk;
  sessions?: StaffSettingsSession[];
  error?: string;
}> {
  const response = await apiFetch('/api/v1/dashboard/staff/settings');
  const parsed = await parseApiResponse<{ desk: StaffSettingsDesk; sessions: StaffSettingsSession[] }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { desk: parsed.data.desk, sessions: parsed.data.sessions };
}

export async function patchStaffNotificationPreferences(input: Partial<StaffSettingsDesk['notifications']>): Promise<{
  notifications?: StaffSettingsDesk['notifications'];
  error?: string;
}> {
  const response = await apiFetchMutating('/api/v1/dashboard/staff/settings/notifications', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  const parsed = await parseApiResponse<{ notifications: StaffSettingsDesk['notifications'] }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { notifications: parsed.data.notifications };
}

export async function revokeStaffOtherSessions(): Promise<{ error?: string }> {
  const response = await apiFetchMutating('/api/v1/dashboard/staff/settings/sessions/revoke-others', {
    method: 'POST',
  });
  const parsed = await parseApiResponse<{ revoked: boolean }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return {};
}

export async function submitStaffReport(
  input: StaffReportIncidentInput,
): Promise<{ record?: StaffReportDesk['records'][number]; error?: string }> {
  const response = await apiFetch('/api/v1/dashboard/staff/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const parsed = await parseApiResponse<{ record: StaffReportDesk['records'][number] }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { record: parsed.data.record };
}

export async function fetchStaffDutySchedule(options?: {
  from?: string;
  to?: string;
}): Promise<{ schedule?: StaffDutySchedule; error?: string }> {
  const params = new URLSearchParams();
  if (options?.from) params.set('from', options.from);
  if (options?.to) params.set('to', options.to);
  const qs = params.toString();
  const response = await apiFetch(`/api/v1/dashboard/staff/schedule${qs ? `?${qs}` : ''}`);
  const parsed = await parseApiResponse<{ schedule: StaffDutySchedule }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { schedule: parsed.data.schedule };
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
