import type { StaffDutyRole } from '@/components/dashboard/staff-portal/staff-nav-permissions';
import type { StaffShiftState } from '@/components/dashboard/staff-portal/staff-topbar-data';

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
};

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
    workplace: { name: workplaceName.replace(/^Hostel · /, '') || 'Sunrise Boys Hostel', status: 'Active' },
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
    { id: 'message', label: 'Contact Warden', description: 'Send a message', href: '/staff/messages' },
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
