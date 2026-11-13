import type { AttendanceRosterRow, AttendanceSession } from '@/components/dashboard/attendance/admin-attendance-data';
import type { NightAttendanceSummary } from '@/lib/api/attendance';

function attendanceRatePercent(present: number, absent: number, onLeave: number): number | null {
  const marked = present + absent + onLeave;
  if (marked === 0) return null;
  return Math.round((present / marked) * 1000) / 10;
}

export function scopeRosterToHostel(roster: AttendanceRosterRow[], hostelName: string): AttendanceRosterRow[] {
  if (!hostelName || hostelName === 'All Hostels' || hostelName === 'No hostel assigned') {
    return roster;
  }
  return roster.filter((row) => row.hostel === hostelName);
}

export function scopeSessionsToHostel(sessions: AttendanceSession[], hostelName: string): AttendanceSession[] {
  if (!hostelName || hostelName === 'All Hostels' || hostelName === 'No hostel assigned') {
    return sessions;
  }
  return sessions.filter((s) => s.hostel === hostelName);
}

/** Recompute KPIs for a subset of roster rows (e.g. topbar-selected hostel). */
export function deriveNightAttendanceSummary(
  base: NightAttendanceSummary,
  roster: AttendanceRosterRow[],
): NightAttendanceSummary {
  let presentToday = 0;
  let absentToday = 0;
  let onLeaveToday = 0;
  let unmarked = 0;
  let unexplainedAbsent = 0;
  const hostels = new Set<string>();
  const blocks = new Set<string>();
  const floors = new Set<string>();

  for (const row of roster) {
    hostels.add(row.hostel);
    blocks.add(row.block);
    floors.add(row.floor);
    switch (row.mark) {
      case 'Present':
        presentToday += 1;
        break;
      case 'Absent':
        absentToday += 1;
        if (row.consecutiveUnexplained > 0) {
          unexplainedAbsent += 1;
        }
        break;
      case 'On Leave':
        onLeaveToday += 1;
        break;
      default:
        unmarked += 1;
        break;
    }
  }

  return {
    ...base,
    todayRatePct: attendanceRatePercent(presentToday, absentToday, onLeaveToday),
    presentToday,
    absentToday,
    onLeaveToday,
    unexplainedAbsent,
    residentsTotal: roster.length,
    unmarked,
    facets: {
      hostels: [...hostels].sort(),
      blocks: [...blocks].sort(),
      floors: [...floors].sort(),
    },
  };
}
