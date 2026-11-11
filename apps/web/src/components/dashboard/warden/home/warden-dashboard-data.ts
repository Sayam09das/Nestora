import type { OperationalDashboardOverview } from '@/lib/api/dashboard';

export type WardenIssueRow = {
  id: string;
  issue: string;
  room: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Assigned' | 'In progress';
};

export type WardenVisitorRow = {
  id: string;
  name: string;
  visiting: string;
  room: string;
  time: string;
};

export type WardenAdmissionRow = {
  id: string;
  name: string;
  registrationNo: string;
  course: string;
  submittedAt: string;
};

export type WardenIncidentRow = {
  id: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium';
  status: 'Open' | 'Acknowledged' | 'In progress';
  reportedAt: string;
};

export type WardenDashboardSnapshot = {
  hostelName: string;
  kpis: {
    students: { value: number; hint: string };
    occupancy: { percent: number; occupied: number; total: number };
    presentToday: { value: number; percent: number };
    leaveRequests: { value: number; hint: string };
    complaints: { value: number; hint: string };
  };
  attendance: {
    percent: number;
    present: number;
    totalStudents: number;
    absent: number;
    onLeave: number;
    sentiment: string;
  };
  pending: {
    total: number;
    leave: number;
    outings: number;
    admissions: number;
    complaints: number;
    maintenance: number;
  };
  admissionsQueue: WardenAdmissionRow[];
  incidents: {
    activeCount: number;
    items: WardenIncidentRow[];
  };
  issues: WardenIssueRow[];
  visitors: {
    total: number;
    checkedOut: number;
    inside: number;
    recent: WardenVisitorRow[];
  };
  /** When true, headline KPIs/attendance came from `/api/v1/dashboard/warden/overview`. */
  liveMetrics?: boolean;
};

function pendingTotal(pending: WardenDashboardSnapshot['pending']): number {
  return pending.leave + pending.outings + pending.admissions + pending.complaints + pending.maintenance;
}

const SUNRISE_BOYS: WardenDashboardSnapshot = {
  hostelName: 'Sunrise Boys Hostel',
  kpis: {
    students: { value: 240, hint: 'Total residents' },
    occupancy: { percent: 86.4, occupied: 216, total: 250 },
    presentToday: { value: 198, percent: 82.5 },
    leaveRequests: { value: 12, hint: 'Awaiting approval' },
    complaints: { value: 8, hint: 'Open complaints' },
  },
  attendance: {
    percent: 82.5,
    present: 198,
    totalStudents: 240,
    absent: 32,
    onLeave: 10,
    sentiment: 'Good attendance',
  },
  pending: {
    total: 0,
    leave: 12,
    outings: 5,
    admissions: 4,
    complaints: 5,
    maintenance: 3,
  },
  admissionsQueue: [
    {
      id: 'adm-1',
      name: 'Vikram Mehta',
      registrationNo: 'NSU/25/1042',
      course: 'B.Tech CSE',
      submittedAt: 'Today · 09:10',
    },
    {
      id: 'adm-2',
      name: 'Soham Patel',
      registrationNo: 'NSU/25/1088',
      course: 'BBA',
      submittedAt: 'Yesterday · 16:45',
    },
    {
      id: 'adm-3',
      name: 'Karan Desai',
      registrationNo: 'NSU/25/1101',
      course: 'B.Sc Physics',
      submittedAt: 'Yesterday · 11:20',
    },
  ],
  incidents: {
    activeCount: 2,
    items: [
      {
        id: 'inc-1',
        title: 'Unauthorized guest in Block B corridor',
        severity: 'High',
        status: 'Acknowledged',
        reportedAt: '11:40 AM',
      },
      {
        id: 'inc-2',
        title: 'Minor fire alarm test — west wing',
        severity: 'Medium',
        status: 'In progress',
        reportedAt: '09:05 AM',
      },
    ],
  },
  issues: [
    { id: 'iss-1', issue: 'Water leakage', room: '204', priority: 'High', status: 'Open' },
    { id: 'iss-2', issue: 'Fan not working', room: '108', priority: 'Medium', status: 'Assigned' },
    { id: 'iss-3', issue: 'Bathroom cleaning', room: '302', priority: 'Low', status: 'Open' },
    { id: 'iss-4', issue: 'Electrical issue', room: '211', priority: 'High', status: 'In progress' },
  ],
  visitors: {
    total: 18,
    checkedOut: 12,
    inside: 6,
    recent: [
      { id: 'v-1', name: 'Rahul Sharma', visiting: 'Amit', room: '204', time: '10:30 AM' },
      { id: 'v-2', name: 'Priya Das', visiting: 'Sneha', room: '112', time: '11:15 AM' },
      { id: 'v-3', name: 'Amit Roy', visiting: 'Arjun', room: '305', time: '12:05 PM' },
    ],
  },
};

SUNRISE_BOYS.pending.total = pendingTotal(SUNRISE_BOYS.pending);

const GIRLS_VARIANT: WardenDashboardSnapshot = {
  ...SUNRISE_BOYS,
  hostelName: 'Sunrise Girls Hostel',
  kpis: {
    students: { value: 186, hint: 'Total residents' },
    occupancy: { percent: 91.2, occupied: 168, total: 184 },
    presentToday: { value: 154, percent: 82.8 },
    leaveRequests: { value: 8, hint: 'Awaiting approval' },
    complaints: { value: 5, hint: 'Open complaints' },
  },
  attendance: {
    percent: 82.8,
    present: 154,
    totalStudents: 186,
    absent: 24,
    onLeave: 8,
    sentiment: 'Good attendance',
  },
  pending: {
    total: 0,
    leave: 8,
    outings: 3,
    admissions: 2,
    complaints: 4,
    maintenance: 2,
  },
  admissionsQueue: SUNRISE_BOYS.admissionsQueue.slice(0, 2),
  incidents: { activeCount: 1, items: SUNRISE_BOYS.incidents.items.slice(0, 1) },
};

GIRLS_VARIANT.pending.total = pendingTotal(GIRLS_VARIANT.pending);

/** Zeroed baseline for KPIs/attendance; desk panels stay empty until their APIs exist. */
export function createEmptyWardenSnapshot(hostelLabel: string): WardenDashboardSnapshot {
  const pending = { leave: 0, outings: 0, admissions: 0, complaints: 0, maintenance: 0, total: 0 };
  return {
    hostelName: hostelLabel,
    kpis: {
      students: { value: 0, hint: 'Total residents' },
      occupancy: { percent: 0, occupied: 0, total: 0 },
      presentToday: { value: 0, percent: 0 },
      leaveRequests: { value: 0, hint: 'Awaiting approval' },
      complaints: { value: 0, hint: 'Open complaints' },
    },
    attendance: {
      percent: 0,
      present: 0,
      totalStudents: 0,
      absent: 0,
      onLeave: 0,
      sentiment: 'No attendance recorded today',
    },
    pending,
    admissionsQueue: [],
    incidents: { activeCount: 0, items: [] },
    issues: [],
    visitors: { total: 0, checkedOut: 0, inside: 0, recent: [] },
  };
}

/** @deprecated Illustrative-only previews; do not use on the live home dashboard. */
export function getWardenDashboardSnapshot(hostelId: string): WardenDashboardSnapshot {
  if (hostelId === 'girls-b') return structuredClone(GIRLS_VARIANT);
  return structuredClone(SUNRISE_BOYS);
}

function attendanceSentiment(percent: number): string {
  if (percent >= 80) return 'Good attendance';
  if (percent >= 65) return 'Monitor closely';
  return 'Low attendance today';
}

/** Overlay API overview (FR-124) onto illustrative desk snapshot where fields exist. */
export function mergeWardenSnapshotWithOverview(
  base: WardenDashboardSnapshot,
  overview: OperationalDashboardOverview | null,
): WardenDashboardSnapshot {
  if (!overview) return base;

  const students = overview.residents.activeAllocations;
  const totalBeds = overview.occupancy.totalOperationalBeds || base.kpis.occupancy.total;
  const occupied = overview.occupancy.occupiedBeds;
  const occPercent = overview.occupancy.percent ?? base.kpis.occupancy.percent;

  const present = overview.attendanceToday.present;
  const absent = overview.attendanceToday.absent;
  const onLeave = overview.attendanceToday.onLeave;
  const totalStudents = students > 0 ? students : base.attendance.totalStudents;
  const attPercent =
    overview.attendanceToday.percent ??
    (totalStudents > 0 ? Math.round((present / totalStudents) * 1000) / 10 : base.attendance.percent);

  const pending = {
    leave: overview.approvals.leaveRequests,
    outings: base.pending.outings,
    admissions: overview.approvals.pendingAdmissions,
    complaints: overview.approvals.complaints || overview.operations.openComplaints,
    maintenance: base.pending.maintenance,
    total: 0,
  };
  pending.total = pendingTotal(pending);

  const hostelName =
    overview.scope.unassigned || overview.scope.hostelNames.length === 0
      ? 'No hostel assigned'
      : overview.scope.hostelNames.length === 1
        ? overview.scope.hostelNames[0]!
        : overview.scope.hostelNames.join(' · ');

  return {
    ...base,
    liveMetrics: true,
    hostelName,
    kpis: {
      students: { value: students, hint: 'Total residents' },
      occupancy: {
        percent: occPercent,
        occupied,
        total: totalBeds,
      },
      presentToday: {
        value: present,
        percent: attPercent,
      },
      leaveRequests: {
        value: overview.approvals.leaveRequests,
        hint: 'Awaiting approval',
      },
      complaints: {
        value: overview.operations.openComplaints,
        hint: 'Open complaints',
      },
    },
    attendance: {
      percent: attPercent,
      present,
      totalStudents,
      absent,
      onLeave,
      sentiment: attendanceSentiment(attPercent),
    },
    pending,
  };
}
