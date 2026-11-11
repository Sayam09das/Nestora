import { STUDENT_DEMO_HOSTEL } from '@/components/dashboard/student-portal/student-topbar-data';

export type StudentLeaveStatus = 'pending' | 'approved' | 'rejected';

export type StudentLeavePreview = {
  id: string;
  title: string;
  status: StudentLeaveStatus;
  dateRange: string;
  statusNote: string;
};

export type StudentComplaintPreview = {
  id: string;
  title: string;
  location: string;
  status: 'in_progress' | 'resolved' | 'open';
  statusLabel: string;
};

export type StudentAnnouncementPreview = {
  id: string;
  title: string;
  relativeTime: string;
  body: string;
  author: string;
};

export type StudentEventPreview = {
  id: string;
  day: string;
  month: string;
  title: string;
  schedule: string;
};

export type StudentRoommatePreview = {
  id: string;
  name: string;
  program: string;
  initials: string;
};

export type StudentQuickAction = {
  id: string;
  label: string;
  description: string;
  href: string;
  requiresFees?: boolean;
};

export type StudentDashboardSnapshot = {
  hostelName: string;
  roomNumber: string;
  bedNumber: string;
  block: string;
  floor: string;
  capacity: number;
  roomStatus: 'occupied' | 'vacant';
  attendancePercent: number;
  attendanceMonth: string;
  attendanceStanding: string;
  attendancePresent: number;
  attendanceAbsent: number;
  attendanceLeave: number;
  leaveTotal: number;
  leavePending: number;
  leaveApproved: number;
  leaveRequests: StudentLeavePreview[];
  feesOutstanding: number;
  feesTotal: number;
  feesPaid: number;
  feesDueDate: string;
  complaints: StudentComplaintPreview[];
  announcements: StudentAnnouncementPreview[];
  events: StudentEventPreview[];
  roommates: StudentRoommatePreview[];
};

const DEMO_SNAPSHOT: StudentDashboardSnapshot = {
  hostelName: STUDENT_DEMO_HOSTEL,
  roomNumber: '204',
  bedNumber: 'A',
  block: 'Block A',
  floor: 'Second Floor',
  capacity: 4,
  roomStatus: 'occupied',
  attendancePercent: 92.3,
  attendanceMonth: 'November 2026',
  attendanceStanding: 'Good standing',
  attendancePresent: 24,
  attendanceAbsent: 1,
  attendanceLeave: 1,
  leaveTotal: 2,
  leavePending: 1,
  leaveApproved: 1,
  leaveRequests: [
    {
      id: 'lv1',
      title: 'Personal Visit',
      status: 'pending',
      dateRange: '12 Nov – 13 Nov 2026',
      statusNote: 'Awaiting Warden approval',
    },
    {
      id: 'lv2',
      title: 'Family Function',
      status: 'approved',
      dateRange: '05 Nov – 06 Nov 2026',
      statusNote: 'Approved by Warden',
    },
  ],
  feesOutstanding: 2500,
  feesTotal: 30_000,
  feesPaid: 27_500,
  feesDueDate: '15 Nov 2026',
  complaints: [
    {
      id: 'c1',
      title: 'Ceiling Fan Not Working',
      location: 'Room 204',
      status: 'in_progress',
      statusLabel: 'In Progress',
    },
    {
      id: 'c2',
      title: 'Bathroom Water Leakage',
      location: 'Common Bathroom',
      status: 'resolved',
      statusLabel: 'Resolved',
    },
  ],
  announcements: [
    {
      id: 'a1',
      title: 'Monthly Hostel Meeting',
      relativeTime: 'Today',
      body: 'All students are requested to attend the monthly hostel meeting.',
      author: 'Posted by Warden',
    },
    {
      id: 'a2',
      title: 'Water Supply Maintenance',
      relativeTime: 'Yesterday',
      body: 'Water supply will be temporarily interrupted tomorrow morning.',
      author: 'Posted by Administration',
    },
  ],
  events: [
    {
      id: 'e1',
      day: '14',
      month: 'NOV',
      title: 'Hostel Cultural Night',
      schedule: '06:00 PM · Main Auditorium',
    },
    {
      id: 'e2',
      day: '18',
      month: 'NOV',
      title: 'Sports Tournament',
      schedule: '09:00 AM · Hostel Ground',
    },
  ],
  roommates: [
    { id: 'rm1', name: 'Rahul Verma', program: 'B.Tech · 3rd Year', initials: 'RV' },
    { id: 'rm2', name: 'Amit Roy', program: 'BBA · 1st Year', initials: 'AR' },
  ],
};

export function buildStudentDashboardSnapshot(
  hostelName?: string,
  roomLabel?: string,
): StudentDashboardSnapshot {
  const bedMatch = roomLabel?.match(/Bed\s*([A-Za-z0-9]+)/i);
  const bedNumber = bedMatch?.[1] ?? DEMO_SNAPSHOT.bedNumber;
  return {
    ...DEMO_SNAPSHOT,
    hostelName: hostelName || DEMO_SNAPSHOT.hostelName,
    bedNumber,
    roomNumber: DEMO_SNAPSHOT.roomNumber,
  };
}

export const STUDENT_QUICK_ACTIONS: StudentQuickAction[] = [
  {
    id: 'leave',
    label: 'Apply for Leave',
    description: 'Submit a leave request',
    href: '/student/leave',
  },
  {
    id: 'complaint',
    label: 'Submit Complaint',
    description: 'Report an issue',
    href: '/student/complaints',
  },
  {
    id: 'visitor',
    label: 'Visitor Request',
    description: 'Request a visitor',
    href: '/student/visitors',
  },
  {
    id: 'fees',
    label: 'Pay Fees',
    description: 'Check outstanding dues',
    href: '/student/fees',
    requiresFees: true,
  },
];

export function formatInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
