export type AttendanceMark = 'Present' | 'Absent' | 'On Leave' | 'Unmarked';

export type AttendanceRosterRow = {
  id: string;
  studentId: string;
  studentName: string;
  hostel: string;
  block: string;
  floor: string;
  roomNumber: string;
  mark: AttendanceMark;
  onApprovedLeave: boolean;
  consecutiveUnexplained: number;
};

export type AttendanceSession = {
  id: string;
  date: string;
  hostel: string;
  block: string;
  floor: string;
  submittedBy: string;
  submittedAt: string;
  present: number;
  absent: number;
  onLeave: number;
  totalResidents: number;
  status: 'Draft' | 'Published';
};

export type AttendanceRevision = {
  id: string;
  timestamp: string;
  editor: string;
  studentId: string;
  from: AttendanceMark;
  to: AttendanceMark;
  reason: string;
};

export const ATTENDANCE_STATS = {
  todayRatePct: 92.4,
  presentToday: 416,
  absentToday: 34,
  onLeaveToday: 28,
  unexplainedAbsent: 12,
  openDisputes: 3,
  residentsTotal: 478,
} as const;

export const CONSECUTIVE_ALERT_THRESHOLD = 3;

export const ATTENDANCE_HOSTEL_FILTERS = [
  'All Hostels',
  'Boys Hostel A',
  'Girls Hostel B',
  'Graduate Wing C',
] as const;

export const ATTENDANCE_BLOCK_FILTERS = ['All Blocks', 'Block A', 'Block B', 'Block C'] as const;
export const ATTENDANCE_FLOOR_FILTERS = ['All Floors', 'Ground Floor', '1st Floor', '2nd Floor', '3rd Floor'] as const;
export const ATTENDANCE_MARK_FILTERS = ['All Marks', 'Present', 'Absent', 'On Leave', 'Unmarked'] as const;

export function formatAttendanceDate(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

export function formatAttendanceDateTime(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function sessionRate(session: AttendanceSession): number {
  if (session.totalResidents === 0) return 0;
  return Math.round((session.present / session.totalResidents) * 1000) / 10;
}

export const SAMPLE_ROSTER: AttendanceRosterRow[] = [
  { id: 'r1', studentId: 'STU-001', studentName: 'Aarav Sharma', hostel: 'Boys Hostel A', block: 'Block A', floor: '2nd Floor', roomNumber: 'A-204', mark: 'Present', onApprovedLeave: false, consecutiveUnexplained: 0 },
  { id: 'r2', studentId: 'STU-005', studentName: 'Rohan Gupta', hostel: 'Boys Hostel A', block: 'Block A', floor: '2nd Floor', roomNumber: 'A-205', mark: 'Present', onApprovedLeave: false, consecutiveUnexplained: 0 },
  { id: 'r3', studentId: 'STU-008', studentName: 'Vikram Joshi', hostel: 'Boys Hostel A', block: 'Block A', floor: '2nd Floor', roomNumber: 'A-206', mark: 'Absent', onApprovedLeave: false, consecutiveUnexplained: 2 },
  { id: 'r4', studentId: 'STU-011', studentName: 'Karan Mehta', hostel: 'Boys Hostel A', block: 'Block A', floor: '2nd Floor', roomNumber: 'A-207', mark: 'On Leave', onApprovedLeave: true, consecutiveUnexplained: 0 },
  { id: 'r5', studentId: 'STU-014', studentName: 'Aditya Rao', hostel: 'Boys Hostel A', block: 'Block A', floor: '1st Floor', roomNumber: 'A-102', mark: 'Present', onApprovedLeave: false, consecutiveUnexplained: 0 },
  { id: 'r6', studentId: 'STU-002', studentName: 'Priya Das', hostel: 'Girls Hostel B', block: 'Block B', floor: '1st Floor', roomNumber: 'B-108', mark: 'Present', onApprovedLeave: false, consecutiveUnexplained: 0 },
  { id: 'r7', studentId: 'STU-004', studentName: 'Ananya Roy', hostel: 'Girls Hostel B', block: 'Block B', floor: '2nd Floor', roomNumber: 'B-212', mark: 'Present', onApprovedLeave: false, consecutiveUnexplained: 0 },
  { id: 'r8', studentId: 'STU-009', studentName: 'Isha Patel', hostel: 'Girls Hostel B', block: 'Block B', floor: '2nd Floor', roomNumber: 'B-213', mark: 'Absent', onApprovedLeave: false, consecutiveUnexplained: 3 },
  { id: 'r9', studentId: 'STU-012', studentName: 'Arjun Nambiar', hostel: 'Graduate Wing C', block: 'Block C', floor: '3rd Floor', roomNumber: 'C-301', mark: 'On Leave', onApprovedLeave: true, consecutiveUnexplained: 0 },
  { id: 'r10', studentId: 'STU-015', studentName: 'Nikhil Das', hostel: 'Boys Hostel A', block: 'Block A', floor: '2nd Floor', roomNumber: 'A-208', mark: 'Unmarked', onApprovedLeave: false, consecutiveUnexplained: 0 },
];

export const SAMPLE_SESSIONS: AttendanceSession[] = [
  {
    id: 'sess1',
    date: '2026-03-09',
    hostel: 'Boys Hostel A',
    block: 'Block A',
    floor: '2nd Floor',
    submittedBy: 'Mr. Rajesh Kumar',
    submittedAt: '2026-03-09T22:15:00Z',
    present: 58,
    absent: 4,
    onLeave: 2,
    totalResidents: 64,
    status: 'Published',
  },
  {
    id: 'sess2',
    date: '2026-03-09',
    hostel: 'Girls Hostel B',
    block: 'Block B',
    floor: '2nd Floor',
    submittedBy: 'Dr. Meera Nair',
    submittedAt: '2026-03-09T22:05:00Z',
    present: 52,
    absent: 3,
    onLeave: 5,
    totalResidents: 60,
    status: 'Published',
  },
  {
    id: 'sess3',
    date: '2026-03-08',
    hostel: 'Boys Hostel A',
    block: 'Block A',
    floor: '1st Floor',
    submittedBy: 'Mrs. Anita Sharma',
    submittedAt: '2026-03-08T22:30:00Z',
    present: 44,
    absent: 2,
    onLeave: 1,
    totalResidents: 47,
    status: 'Published',
  },
  {
    id: 'sess4',
    date: '2026-03-10',
    hostel: 'Boys Hostel A',
    block: 'Block A',
    floor: '2nd Floor',
    submittedBy: 'Mr. Rajesh Kumar',
    submittedAt: '2026-03-10T21:00:00Z',
    present: 0,
    absent: 0,
    onLeave: 2,
    totalResidents: 64,
    status: 'Draft',
  },
];

export const SAMPLE_REVISIONS: AttendanceRevision[] = [
  {
    id: 'rev1',
    timestamp: '2026-03-08T23:10:00Z',
    editor: 'Mr. Rajesh Kumar',
    studentId: 'STU-008',
    from: 'Absent',
    to: 'On Leave',
    reason: 'Leave approval synced after roll call',
  },
  {
    id: 'rev2',
    timestamp: '2026-03-07T22:45:00Z',
    editor: 'Dr. Meera Nair',
    studentId: 'STU-009',
    from: 'Present',
    to: 'Absent',
    reason: 'Discrepancy review — gate log mismatch',
  },
];

export function getSessionById(id: string): AttendanceSession | undefined {
  return SAMPLE_SESSIONS.find((s) => s.id === id);
}

export const MARK_CYCLE: AttendanceMark[] = ['Unmarked', 'Present', 'Absent', 'On Leave'];

export function nextMark(current: AttendanceMark): AttendanceMark {
  const i = MARK_CYCLE.indexOf(current);
  return MARK_CYCLE[(i + 1) % MARK_CYCLE.length] ?? 'Present';
}
