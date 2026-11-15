import type { ComplaintTicket } from '@/components/dashboard/complaints/admin-complaints-data';
import { formatComplaintWhen } from '@/components/dashboard/complaints/admin-complaints-data';
import type { AnnouncementRecord } from '@/components/dashboard/announcements/admin-announcements-data';
import type { StaffDutyRole } from '@/components/dashboard/staff-portal/staff-nav-permissions';
import type { StaffShiftDisplay, StaffShiftState } from '@/components/dashboard/staff-portal/staff-topbar-data';
import type { OperationalDashboardOverview } from '@/lib/api/dashboard';
import { formatRelativeTimeFromIso } from '@/lib/format-relative-time';

export type StaffTaskStatus = 'completed' | 'in_progress' | 'pending' | 'overdue';

export type StaffDashboardTask = {
  id: string;
  title: string;
  category: string;
  area: string;
  time: string;
  status: StaffTaskStatus;
};

export type StaffAnnouncement = {
  id: string;
  title: string;
  body: string;
  author: string;
  time: string;
};

export type StaffQuickAction = {
  id: string;
  label: string;
  description: string;
  href: string;
};

export type StaffDashboardSnapshot = {
  roleFocus: string;
  tasksSectionTitle: string;
  workplace: { name: string; status: 'Active' | 'Standby' };
  kpis: {
    assigned: number;
    completed: number;
    inProgress: number;
    overdue: number;
  };
  shift: {
    state: StaffShiftState;
    stateLabel: string;
    start: string;
    end: string;
    elapsed: string;
    checkIn: string;
    checkOut: string | null;
    location: string;
  };
  tasks: StaffDashboardTask[];
  tasksTotal: number;
  progress: {
    percent: number;
    completed: number;
    assigned: number;
    message: string;
  };
  attendance: {
    presentDays: number;
    totalDays: number;
    percent: number;
    present: number;
    absent: number;
    leave: number;
    checkIn: string;
    checkOut: string | null;
  };
  announcements: StaffAnnouncement[];
  liveMetrics?: boolean;
};

const UUID_PREFIX = /^[0-9a-f]{8}-[0-9a-f]{4}-/i;

export function normalizeStaffWorkplaceName(name: string): string {
  const stripped = name.replace(/^Hostel ·\s*/i, '').trim();
  if (!stripped || stripped === 'Assigned hostel') return 'Assigned hostel';
  if (UUID_PREFIX.test(stripped)) return 'Assigned hostel';
  return stripped;
}

const STATUS_ORDER: Record<StaffTaskStatus, number> = {
  overdue: 0,
  in_progress: 1,
  pending: 2,
  completed: 3,
};

const SECURITY_TASKS: StaffDashboardTask[] = [
  { id: 's1', title: 'Inspect main entrance', category: 'Security', area: 'Main Gate', time: '09:00 AM', status: 'completed' },
  { id: 's2', title: 'Check visitor register', category: 'Security', area: 'Reception', time: '10:30 AM', status: 'completed' },
  { id: 's3', title: 'Inspect CCTV cameras', category: 'Security', area: 'Control Room', time: '12:00 PM', status: 'in_progress' },
  { id: 's4', title: 'Evening security patrol', category: 'Security', area: 'All Floors', time: '03:00 PM', status: 'pending' },
];

const HOUSEKEEPING_TASKS: StaffDashboardTask[] = [
  { id: 'h1', title: 'Lobby deep clean', category: 'Housekeeping', area: 'Block A', time: '08:30 AM', status: 'completed' },
  { id: 'h2', title: 'Washroom inspection', category: 'Housekeeping', area: 'Floor 2', time: '10:00 AM', status: 'completed' },
  { id: 'h3', title: 'Linen change — rooms 201–210', category: 'Housekeeping', area: 'Block B', time: '11:30 AM', status: 'in_progress' },
  { id: 'h4', title: 'Common area sanitization', category: 'Housekeeping', area: 'Mess corridor', time: '02:00 PM', status: 'pending' },
];

const MAINTENANCE_TASKS: StaffDashboardTask[] = [
  { id: 'm1', title: 'Ceiling fan repair', category: 'Maintenance', area: 'Room A-210', time: '09:00 AM', status: 'completed' },
  { id: 'm2', title: 'Water leak — Block B', category: 'Maintenance', area: 'Bath block', time: '10:30 AM', status: 'in_progress' },
  { id: 'm3', title: 'Elevator safety check', category: 'Maintenance', area: 'Main building', time: '01:00 PM', status: 'pending' },
  { id: 'm4', title: 'Replace corridor lights', category: 'Maintenance', area: 'Floor 3', time: '03:30 PM', status: 'pending' },
];

const RECEPTION_TASKS: StaffDashboardTask[] = [
  { id: 'r1', title: 'Visitor pre-registration review', category: 'Reception', area: 'Front desk', time: '09:00 AM', status: 'completed' },
  { id: 'r2', title: 'Parent enquiry callbacks', category: 'Reception', area: 'Phone desk', time: '10:00 AM', status: 'completed' },
  { id: 'r3', title: 'Check-in: late arrival batch', category: 'Reception', area: 'Gate', time: '12:30 PM', status: 'in_progress' },
  { id: 'r4', title: 'Visitor gate passes', category: 'Reception', area: 'Security desk', time: '04:00 PM', status: 'pending' },
];

const MESS_TASKS: StaffDashboardTask[] = [
  { id: 'ms1', title: 'Breakfast prep audit', category: 'Mess', area: 'Kitchen 1', time: '06:30 AM', status: 'completed' },
  { id: 'ms2', title: 'Lunch service line setup', category: 'Mess', area: 'Dining hall', time: '11:00 AM', status: 'completed' },
  { id: 'ms3', title: 'Hygiene check — storage', category: 'Mess', area: 'Cold storage', time: '12:15 PM', status: 'in_progress' },
  { id: 'ms4', title: 'Dinner inventory count', category: 'Mess', area: 'Pantry', time: '03:00 PM', status: 'pending' },
];

const ROLE_PROFILE: Record<
  StaffDutyRole,
  Pick<StaffDashboardSnapshot, 'roleFocus' | 'tasksSectionTitle' | 'tasks' | 'tasksTotal' | 'kpis' | 'progress'> & {
    shiftLocation: string;
  }
> = {
  security_guard: {
    roleFocus: 'Visitor logs, patrols, CCTV, and incident readiness',
    tasksSectionTitle: "Today's security tasks",
    tasks: SECURITY_TASKS,
    tasksTotal: 12,
    kpis: { assigned: 12, completed: 8, inProgress: 3, overdue: 1 },
    progress: {
      percent: 66.7,
      completed: 8,
      assigned: 12,
      message: 'Keep going! Complete your remaining tasks before the end of your shift.',
    },
    shiftLocation: 'Main Hostel Building',
  },
  housekeeping: {
    roleFocus: 'Cleaning schedules, assigned areas, and completion quality',
    tasksSectionTitle: "Today's cleaning duties",
    tasks: HOUSEKEEPING_TASKS,
    tasksTotal: 14,
    kpis: { assigned: 14, completed: 9, inProgress: 4, overdue: 1 },
    progress: {
      percent: 64.3,
      completed: 9,
      assigned: 14,
      message: 'Finish open floor tasks before the afternoon mess rush.',
    },
    shiftLocation: 'Block A & B corridors',
  },
  maintenance: {
    roleFocus: 'Repair tickets, priority work, and equipment checks',
    tasksSectionTitle: 'Open repair assignments',
    tasks: MAINTENANCE_TASKS,
    tasksTotal: 9,
    kpis: { assigned: 9, completed: 4, inProgress: 3, overdue: 2 },
    progress: {
      percent: 44.4,
      completed: 4,
      assigned: 9,
      message: 'Two overdue tickets need attention before end of shift.',
    },
    shiftLocation: 'Maintenance workshop',
  },
  receptionist: {
    roleFocus: 'Visitor registrations, check-ins, and enquiries',
    tasksSectionTitle: 'Front desk queue',
    tasks: RECEPTION_TASKS,
    tasksTotal: 11,
    kpis: { assigned: 11, completed: 7, inProgress: 2, overdue: 0 },
    progress: {
      percent: 63.6,
      completed: 7,
      assigned: 11,
      message: 'Keep visitor register updated for the evening batch.',
    },
    shiftLocation: 'Reception & main gate',
  },
  mess_staff: {
    roleFocus: 'Meal schedules, prep, inventory, and hygiene',
    tasksSectionTitle: "Today's mess operations",
    tasks: MESS_TASKS,
    tasksTotal: 10,
    kpis: { assigned: 10, completed: 6, inProgress: 2, overdue: 0 },
    progress: {
      percent: 60,
      completed: 6,
      assigned: 10,
      message: 'Complete storage hygiene before dinner prep.',
    },
    shiftLocation: 'Central mess kitchen',
  },
};

const SHARED_ANNOUNCEMENTS: StaffAnnouncement[] = [
  {
    id: 'a1',
    title: 'Security inspection scheduled',
    body: 'Please complete the CCTV and entrance inspection.',
    author: 'Warden',
    time: '10:15 AM',
  },
  {
    id: 'a2',
    title: 'Staff meeting reminder',
    body: 'Monthly staff meeting at the administration office.',
    author: 'Administrator',
    time: 'Yesterday',
  },
];

function mapTicketToTaskStatus(ticket: ComplaintTicket): StaffTaskStatus {
  if (ticket.slaBreached && !['Resolved', 'Rejected'].includes(ticket.status)) return 'overdue';
  if (ticket.status === 'In Progress') return 'in_progress';
  if (ticket.status === 'Resolved') return 'completed';
  if (ticket.status === 'Assigned') return 'in_progress';
  return 'pending';
}

function ticketMatchesStaff(ticket: ComplaintTicket, displayName: string): boolean {
  const assignee = ticket.assignedStaff?.toLowerCase() ?? '';
  if (!assignee) return false;
  const parts = displayName
    .toLowerCase()
    .split(/\s+/)
    .filter((part) => part.length > 2);
  return parts.some((part) => assignee.includes(part));
}

function openTicketsForHostel(tickets: ComplaintTicket[], hostelNames: string[]): ComplaintTicket[] {
  const hostels = new Set(hostelNames.map((n) => n.toLowerCase()));
  return tickets.filter((ticket) => {
    if (['Resolved', 'Rejected'].includes(ticket.status)) return false;
    if (hostels.size === 0) return true;
    return hostels.has(ticket.hostel.toLowerCase());
  });
}

function staffWorkQueue(
  tickets: ComplaintTicket[],
  overview: OperationalDashboardOverview,
  displayName: string,
): ComplaintTicket[] {
  const mine = tickets.filter((ticket) => ticketMatchesStaff(ticket, displayName));
  const openMine = mine.filter((ticket) => !['Resolved', 'Rejected'].includes(ticket.status));
  if (openMine.length > 0) return openMine;

  const quota = overview.operations.myAssignedTickets;
  if (quota <= 0) return [];

  return openTicketsForHostel(tickets, overview.scope.hostelNames)
    .filter((ticket) => ['Assigned', 'In Progress', 'Under Review', 'Reopened', 'Submitted'].includes(ticket.status))
    .slice(0, Math.max(quota, 6));
}

function mapTicketToStaffTask(ticket: ComplaintTicket): StaffDashboardTask {
  return {
    id: ticket.id,
    title: ticket.title,
    category: ticket.category,
    area: ticket.location || ticket.hostel,
    time: formatComplaintWhen(ticket.openedAt),
    status: mapTicketToTaskStatus(ticket),
  };
}

/** Zeroed baseline; filled by {@link mergeStaffSnapshotWithLiveData}. */
export function createEmptyStaffSnapshot(
  role: StaffDutyRole,
  workplaceName: string,
  shiftFromShell?: StaffShiftDisplay,
): StaffDashboardSnapshot {
  const profile = ROLE_PROFILE[role];
  const windowParts = shiftFromShell?.timeWindow.split('–').map((s) => s.trim()) ?? [];
  const start = windowParts[0] ?? '08:00 AM';
  const end = windowParts[1] ?? '04:00 PM';

  return {
    roleFocus: profile.roleFocus,
    tasksSectionTitle: profile.tasksSectionTitle,
    workplace: { name: normalizeStaffWorkplaceName(workplaceName), status: 'Standby' },
    kpis: { assigned: 0, completed: 0, inProgress: 0, overdue: 0 },
    shift: {
      state: shiftFromShell?.state ?? 'off_duty',
      stateLabel: shiftFromShell?.label ?? 'Off duty',
      start,
      end,
      elapsed: '—',
      checkIn: '—',
      checkOut: null,
      location: profile.shiftLocation,
    },
    tasks: [],
    tasksTotal: 0,
    progress: {
      percent: 0,
      completed: 0,
      assigned: 0,
      message: 'No open assignments in your queue.',
    },
    attendance: {
      presentDays: 0,
      totalDays: 0,
      percent: 0,
      present: 0,
      absent: 0,
      leave: 0,
      checkIn: '—',
      checkOut: null,
    },
    announcements: [],
  };
}

export function mergeStaffSnapshotWithLiveData(
  base: StaffDashboardSnapshot,
  overview: OperationalDashboardOverview | null,
  tickets: ComplaintTicket[],
  notices: AnnouncementRecord[],
  displayName: string,
  shiftFromShell?: StaffShiftDisplay,
): StaffDashboardSnapshot {
  if (!overview) return base;

  const workplaceLabel =
    overview.scope.unassigned || overview.scope.hostelNames.length === 0
      ? 'No hostel assigned'
      : overview.scope.hostelNames.length === 1
        ? overview.scope.hostelNames[0]!
        : overview.scope.hostelNames.join(' · ');

  const mine = tickets.filter((ticket) => ticketMatchesStaff(ticket, displayName));
  const openMine = mine.filter((ticket) => !['Resolved', 'Rejected'].includes(ticket.status));
  const queue = staffWorkQueue(tickets, overview, displayName);
  const dutiesToday = overview.operations.dutiesToday;
  const assignedCount = Math.max(
    overview.operations.myAssignedTickets + dutiesToday,
    queue.length,
    openMine.length,
  );
  const completedDistinct = mine.filter((t) => t.status === 'Resolved').length;
  const ticketInProgress = queue.filter((t) => t.status === 'In Progress' || t.status === 'Assigned').length;
  const inProgress = ticketInProgress + (dutiesToday > 0 ? 1 : 0);
  const overdue = queue.filter((t) => t.slaBreached).length;

  const dutyTasks: StaffDashboardTask[] =
    dutiesToday > 0
      ? [
          {
            id: 'duty-today',
            title: 'Hostel duty roster',
            category: 'Duty',
            area: overview.scope.hostelNames[0] ?? 'Assigned hostel',
            time: 'Today',
            status: 'in_progress',
          },
        ]
      : [];

  const tasks = [...dutyTasks, ...queue.map(mapTicketToStaffTask)].sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status],
  );

  const progressPercent =
    assignedCount > 0 ? Math.round((completedDistinct / assignedCount) * 1000) / 10 : 0;

  const windowParts = shiftFromShell?.timeWindow.split('–').map((s) => s.trim()) ?? [];
  const start = windowParts[0] ?? '08:00 AM';
  const end = windowParts[1] ?? '04:00 PM';
  const onDuty = dutiesToday > 0 || shiftFromShell?.state === 'on_duty';

  const scopeNoticeIds = new Set(overview.scope.hostelNames.map((n) => n.toLowerCase()));
  const scopedNotices = notices.filter((notice) => {
    if (notice.scope === 'University-wide') return true;
    if (scopeNoticeIds.size === 0) return true;
    return scopeNoticeIds.has(notice.scope.toLowerCase());
  });

  const announcements: StaffAnnouncement[] = scopedNotices.slice(0, 6).map((notice) => ({
    id: notice.id,
    title: notice.title,
    body: notice.excerpt || notice.title,
    author: notice.publishedBy || 'University Admin',
    time: formatRelativeTimeFromIso(notice.publishedAt),
  }));

  const att = overview.attendanceToday;
  const hostelStudentsToday = att.present + att.absent + att.onLeave;

  return {
    ...base,
    liveMetrics: true,
    workplace: {
      name: normalizeStaffWorkplaceName(workplaceLabel),
      status: onDuty ? 'Active' : 'Standby',
    },
    kpis: {
      assigned: assignedCount,
      completed: completedDistinct,
      inProgress,
      overdue,
    },
    shift: {
      ...base.shift,
      state: onDuty ? 'on_duty' : (shiftFromShell?.state ?? base.shift.state),
      stateLabel: onDuty ? 'On Duty' : (shiftFromShell?.label ?? base.shift.stateLabel),
      start,
      end,
      location: overview.scope.hostelNames[0] ?? base.shift.location,
    },
    tasks,
    tasksTotal: assignedCount,
    progress: {
      percent: progressPercent,
      completed: completedDistinct,
      assigned: assignedCount,
      message:
        assignedCount === 0
          ? 'No open work orders — check announcements or your schedule.'
          : overdue > 0
            ? `${overdue} assignment(s) are past SLA — prioritize those first.`
            : 'Keep going! Complete your remaining tasks before the end of your shift.',
    },
    attendance: {
      ...base.attendance,
      present: att.present,
      absent: att.absent,
      leave: att.onLeave,
      totalDays: hostelStudentsToday,
      presentDays: att.present,
      percent: att.percent ?? (hostelStudentsToday > 0 ? Math.round((att.present / hostelStudentsToday) * 1000) / 10 : 0),
      checkIn: overview.staffShift?.checkInLabel ?? (overview.staffShift?.checkInAt ? 'Recorded' : '—'),
      checkOut: overview.staffShift?.checkOutLabel ?? (overview.staffShift?.checkOutAt ? 'Recorded' : null),
    },
    announcements: announcements.length > 0 ? announcements : base.announcements,
  };
}

/** Full assigned queue for the staff tasks desk (includes resolved tickets). */
export function listStaffAssignedTasks(
  overview: OperationalDashboardOverview | null,
  tickets: ComplaintTicket[],
  displayName: string,
): StaffDashboardTask[] {
  if (!overview) return [];

  let mine = tickets.filter((ticket) => ticketMatchesStaff(ticket, displayName));
  if (mine.length === 0 && overview.operations.myAssignedTickets > 0) {
    const quota = overview.operations.myAssignedTickets;
    mine = openTicketsForHostel(tickets, overview.scope.hostelNames).slice(0, Math.max(quota, 24));
  }

  const dutyTasks: StaffDashboardTask[] =
    overview.operations.dutiesToday > 0
      ? [
          {
            id: 'duty-today',
            title: 'Hostel duty roster',
            category: 'Duty',
            area: overview.scope.hostelNames[0] ?? 'Assigned hostel',
            time: 'Today',
            status: 'in_progress',
          },
        ]
      : [];

  return [...dutyTasks, ...mine.map(mapTicketToStaffTask)].sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status],
  );
}

/** @deprecated Demo snapshot; use createEmptyStaffSnapshot + mergeStaffSnapshotWithLiveData. */
export function buildStaffDashboardSnapshot(
  role: StaffDutyRole,
  workplaceName: string,
  shiftFromShell?: { state: StaffShiftState; label: string; timeWindow: string },
): StaffDashboardSnapshot {
  const profile = ROLE_PROFILE[role];
  const windowParts = shiftFromShell?.timeWindow.split('–').map((s) => s.trim()) ?? [];
  const start = windowParts[0] ?? '08:00 AM';
  const end = windowParts[1] ?? '04:00 PM';

  const tasks = [...profile.tasks].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);

  return {
    roleFocus: profile.roleFocus,
    tasksSectionTitle: profile.tasksSectionTitle,
    workplace: { name: normalizeStaffWorkplaceName(workplaceName), status: 'Active' },
    kpis: profile.kpis,
    shift: {
      state: shiftFromShell?.state ?? 'on_duty',
      stateLabel: shiftFromShell?.label ?? 'On Duty',
      start,
      end,
      elapsed: '04h 20m',
      checkIn: '08:00 AM',
      checkOut: null,
      location: profile.shiftLocation,
    },
    tasks,
    tasksTotal: profile.tasksTotal,
    progress: profile.progress,
    attendance: {
      presentDays: 24,
      totalDays: 26,
      percent: 92.3,
      present: 24,
      absent: 1,
      leave: 1,
      checkIn: '08:00 AM',
      checkOut: null,
    },
    announcements: SHARED_ANNOUNCEMENTS,
  };
}

export function buildStaffQuickActions(role: StaffDutyRole): StaffQuickAction[] {
  const common: StaffQuickAction[] = [
    { id: 'task', label: 'Update Task', description: 'Update task progress', href: '/staff/tasks' },
    { id: 'report', label: 'Report Issue', description: 'Notify the Warden', href: '/staff/report' },
    { id: 'schedule', label: 'View Schedule', description: 'Check upcoming shifts', href: '/staff/schedule' },
    { id: 'message', label: 'Messages', description: 'Notices & work alerts', href: '/staff/messages' },
  ];

  if (role === 'security_guard') {
    return [
      { id: 'visitors', label: 'Visitor Log', description: 'Register or verify visitors', href: '/staff/visitors' },
      ...common,
    ].slice(0, 4);
  }
  if (role === 'housekeeping') {
    return [
      { id: 'hk', label: 'Cleaning list', description: 'Open assigned areas', href: '/staff/housekeeping' },
      ...common,
    ].slice(0, 4);
  }
  if (role === 'maintenance') {
    return [
      { id: 'repairs', label: 'Repair queue', description: 'Priority tickets today', href: '/staff/maintenance' },
      ...common,
    ].slice(0, 4);
  }
  if (role === 'receptionist') {
    return [
      { id: 'visitors', label: 'Visitor desk', description: 'Check-ins & passes', href: '/staff/visitors' },
      ...common,
    ].slice(0, 4);
  }
  return [
    { id: 'mess', label: 'Mess roster', description: 'Meal prep & service', href: '/staff/mess' },
    ...common,
  ].slice(0, 4);
}

export const TASK_STATUS_LABELS: Record<StaffTaskStatus, string> = {
  completed: 'Completed',
  in_progress: 'In Progress',
  pending: 'Pending',
  overdue: 'Overdue',
};
