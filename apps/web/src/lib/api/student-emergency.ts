import { apiFetch, apiFetchMutating } from '@/lib/api/client';
import { parseApiResponse } from '@/lib/api/parse-response';

export type EmergencyContactCard = {
  id: string;
  category: 'personal' | 'hostel' | 'campus';
  role: string;
  name: string;
  phone: string | null;
  email: string | null;
  note: string | null;
  telHref: string | null;
};

export type StudentEmergencyNotice = {
  id: string;
  title: string;
  body: string;
  publishedLabel: string;
};

export type StudentEmergencyReportRow = {
  id: string;
  incidentRef: string;
  title: string;
  status: string;
  statusLabel: string;
  severity: string;
  submittedAt: string;
};

export type StudentEmergencyDesk = {
  generatedAt: string;
  profileLinked: boolean;
  hostelName: string | null;
  hostelId: string | null;
  medicalAlert: string | null;
  canReport: boolean;
  contacts: EmergencyContactCard[];
  campusHotlines: EmergencyContactCard[];
  emergencyNotices: StudentEmergencyNotice[];
  myReports: StudentEmergencyReportRow[];
  incidentTypes: readonly string[];
  incidentSeverities: readonly string[];
};

export type StudentReportIncidentInput = {
  title: string;
  description: string;
  location: string;
  incidentType: string;
  initialSeverity: string;
};

export async function fetchStudentEmergencyDesk(): Promise<{
  desk?: StudentEmergencyDesk;
  error?: string;
}> {
  const response = await apiFetch('/api/v1/dashboard/student/emergency');
  const parsed = await parseApiResponse<{ desk: StudentEmergencyDesk }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { desk: parsed.data.desk };
}

export async function submitStudentEmergencyReport(body: StudentReportIncidentInput): Promise<{
  desk?: StudentEmergencyDesk;
  error?: string;
}> {
  const response = await apiFetchMutating('/api/v1/dashboard/student/emergency/report', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  const parsed = await parseApiResponse<{ desk: StudentEmergencyDesk }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { desk: parsed.data.desk };
}