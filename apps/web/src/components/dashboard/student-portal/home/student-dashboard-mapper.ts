import type { StudentDashboardSnapshot } from '@/components/dashboard/student-portal/home/student-dashboard-data';
import type { StudentDashboardOverview } from '@/lib/api/dashboard';

export function emptyStudentDashboardSnapshot(): StudentDashboardSnapshot {
  return {
    hostelName: 'No hostel assigned',
    roomNumber: '—',
    bedNumber: '—',
    block: '—',
    floor: '—',
    capacity: 0,
    roomStatus: 'vacant',
    attendancePercent: 0,
    attendanceMonth: new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(new Date()),
    attendanceStanding: 'No records yet',
    attendancePresent: 0,
    attendanceAbsent: 0,
    attendanceLeave: 0,
    leaveTotal: 0,
    leavePending: 0,
    leaveApproved: 0,
    leaveRequests: [],
    feesOutstanding: 0,
    feesTotal: 0,
    feesPaid: 0,
    feesDueDate: '—',
    complaints: [],
    announcements: [],
    events: [],
    roommates: [],
  };
}

export function mapOverviewToStudentSnapshot(
  overview: StudentDashboardOverview,
): StudentDashboardSnapshot {
  const { residence, attendanceMonth, leave, fees } = overview;
  return {
    hostelName: residence.hostelName ?? 'No hostel assigned',
    roomNumber: residence.roomNumber ?? '—',
    bedNumber: residence.bedNumber ?? '—',
    block: residence.blockName ?? '—',
    floor: residence.floorLabel ?? '—',
    capacity: residence.capacity ?? 0,
    roomStatus: residence.roomStatus,
    attendancePercent: attendanceMonth.percent ?? 0,
    attendanceMonth: attendanceMonth.label,
    attendanceStanding: attendanceMonth.standing,
    attendancePresent: attendanceMonth.present,
    attendanceAbsent: attendanceMonth.absent,
    attendanceLeave: attendanceMonth.onLeave,
    leaveTotal: leave.total,
    leavePending: leave.pending,
    leaveApproved: leave.approved,
    leaveRequests: leave.recent,
    feesOutstanding: fees.outstanding,
    feesTotal: fees.totalAssessed,
    feesPaid: fees.totalPaid,
    feesDueDate: fees.dueDate ?? '—',
    complaints: overview.complaints,
    announcements: overview.announcements,
    events: overview.events,
    roommates: overview.roommates,
  };
}
