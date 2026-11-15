import { apiFetch } from '@/lib/api/client';
import { parseApiResponse } from '@/lib/api/parse-response';

export type StudentAttendanceDayStatus = 'PRESENT' | 'ABSENT' | 'ON_LEAVE';

export type StudentAttendanceDesk = {
  generatedAt: string;
  profileLinked: boolean;
  month: string;
  monthLabel: string;
  summary: {
    percent: number | null;
    present: number;
    absent: number;
    onLeave: number;
    recordedDays: number;
    daysInMonth: number;
    standing: string;
  };
  today: {
    date: string;
    status: StudentAttendanceDayStatus | null;
    recordedAt: string | null;
  };
  calendar: Array<{
    date: string;
    dayOfMonth: number;
    weekdayShort: string;
    isToday: boolean;
    isFuture: boolean;
    status: StudentAttendanceDayStatus | null;
  }>;
  history: Array<{
    id: string;
    date: string;
    dateLabel: string;
    status: StudentAttendanceDayStatus;
    statusLabel: string;
    recordedAt: string;
  }>;
};

export async function fetchStudentAttendanceDesk(month?: string): Promise<{
  desk?: StudentAttendanceDesk;
  error?: string;
}> {
  const search = month ? `?month=${encodeURIComponent(month)}` : '';
  const response = await apiFetch(`/api/v1/dashboard/student/attendance${search}`);
  const parsed = await parseApiResponse<{ desk: StudentAttendanceDesk }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { desk: parsed.data.desk };
}