import type {
  AttendanceRosterRow,
  AttendanceSession,
} from '@/components/dashboard/attendance/admin-attendance-data';
import { apiFetch } from '@/lib/api/client';
import { parseApiResponse } from '@/lib/api/parse-response';

export type NightAttendanceSummary = {
  generatedAt: string;
  sessionDate: string;
  todayRatePct: number | null;
  presentToday: number;
  absentToday: number;
  onLeaveToday: number;
  unexplainedAbsent: number;
  openDisputes: number;
  residentsTotal: number;
  unmarked: number;
  facets: {
    hostels: string[];
    blocks: string[];
    floors: string[];
  };
};

export type NightAttendanceSessionPayload = {
  summary: NightAttendanceSummary;
  roster: AttendanceRosterRow[];
  sessions: AttendanceSession[];
};

export async function fetchNightAttendanceSession(date: string): Promise<{
  session?: NightAttendanceSessionPayload;
  error?: string;
}> {
  const response = await apiFetch(
    `/api/v1/attendance/night-session?${new URLSearchParams({ date })}`,
  );
  const parsed = await parseApiResponse<NightAttendanceSessionPayload>(response);
  if (!parsed.ok) {
    return { error: parsed.message };
  }
  return { session: parsed.data };
}

export async function patchNightAttendanceMark(input: {
  date: string;
  studentId: string;
  mark: 'Present' | 'Absent' | 'On Leave';
}): Promise<{ row?: AttendanceRosterRow; error?: string }> {
  const response = await apiFetch('/api/v1/attendance/night-session/mark', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const parsed = await parseApiResponse<{ row: AttendanceRosterRow }>(response);
  if (!parsed.ok) {
    return { error: parsed.message };
  }
  return { row: parsed.data.row };
}

export async function clearNightAttendanceMark(input: {
  date: string;
  studentId: string;
}): Promise<{ error?: string }> {
  const response = await apiFetch('/api/v1/attendance/night-session/clear', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const parsed = await parseApiResponse<Record<string, never>>(response);
  if (!parsed.ok) {
    return { error: parsed.message };
  }
  return {};
}
