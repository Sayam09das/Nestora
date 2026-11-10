import type { ApiErrorResponse, ApiSuccessResponse } from '@nestora/types';
import type { StudentRecord, StudentStatus } from '@/components/dashboard/students/admin-students-data';
import type { StudentRegistrationForm } from '@/components/dashboard/students/admin-students-registration-constants';
import { apiFetch, apiFetchMutating } from '@/lib/api/client';
import { parseApiResponse } from '@/lib/api/parse-response';

export type StudentDirectorySummary = {
  generatedAt: string;
  total: number;
  active: number;
  pending: number;
  inactive: number;
  activeRatePercent: number | null;
  createdThisMonth: number;
  facets: {
    hostels: string[];
    courses: string[];
    academicYears: string[];
  };
};

type DirectoryRowPayload = {
  id: string;
  studentId: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  academicYear: string;
  hostel: string;
  room: string;
  status: StudentStatus;
  joinedDate: string;
};

function toStudentRecord(row: DirectoryRowPayload): StudentRecord {
  return { ...row };
}

export async function fetchStudentDirectorySummary(): Promise<{
  summary?: StudentDirectorySummary;
  error?: string;
}> {
  const response = await apiFetch('/api/v1/students/directory/summary');
  const parsed = await parseApiResponse<{ summary: StudentDirectorySummary }>(response);
  if (!parsed.ok) {
    return { error: parsed.message };
  }
  return { summary: parsed.data.summary };
}

export type StudentDirectoryListParams = {
  page: number;
  limit: number;
  q?: string;
  status?: StudentStatus;
  hostel?: string;
  course?: string;
  academicYear?: string;
};

export async function fetchStudentDirectoryList(
  params: StudentDirectoryListParams,
): Promise<{
  students?: StudentRecord[];
  total?: number;
  error?: string;
}> {
  const search = new URLSearchParams();
  search.set('page', String(params.page));
  search.set('limit', String(params.limit));
  if (params.q?.trim()) {
    search.set('q', params.q.trim());
  }
  if (params.status) {
    search.set('status', params.status);
  }
  if (params.hostel && params.hostel !== 'All Hostels') {
    search.set('hostel', params.hostel);
  }
  if (params.course && params.course !== 'All Courses') {
    search.set('course', params.course);
  }
  if (params.academicYear && params.academicYear !== 'All Years') {
    search.set('academicYear', params.academicYear);
  }

  const response = await apiFetch(`/api/v1/students/directory?${search.toString()}`);
  let body: ApiSuccessResponse<{ students: DirectoryRowPayload[] }> | ApiErrorResponse;
  try {
    body = (await response.json()) as typeof body;
  } catch {
    return { error: `Request failed (${response.status}).` };
  }
  if (!body.success) {
    return { error: body.error.message };
  }
  return {
    students: body.data.students.map(toStudentRecord),
    total: body.meta?.pagination?.total_records,
  };
}

export type AdminStudentProfile = {
  userId: string;
  directoryStatus: StudentStatus;
  account: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    userStatus: string;
    isVerified: boolean;
    mfaEnabled: boolean;
    mustChangePassword: boolean;
    joinedAt: string;
  };
  student: null | {
    id: string;
    registrationNumber: string;
    course: string;
    department: string;
    academicYear: string;
    currentSemester: string;
    gender: string;
    dateOfBirth: string;
    bloodGroup: string | null;
    medicalAlerts: string | null;
    permanentAddress: string;
    guardianName: string;
    guardianPhone: string;
    guardianRelation: string;
  };
  housing: null | {
    hostelName: string;
    roomNumber: string;
    bedNumber: string;
    allocatedSince: string;
  };
};

export async function fetchAdminStudentProfile(userId: string): Promise<{
  profile?: AdminStudentProfile;
  error?: string;
}> {
  const response = await apiFetch(`/api/v1/students/${encodeURIComponent(userId)}/profile`);
  const parsed = await parseApiResponse<{ profile: AdminStudentProfile }>(response);
  if (!parsed.ok) {
    return { error: parsed.message };
  }
  return { profile: parsed.data.profile };
}

export type RegisterStudentPayload = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: StudentRegistrationForm['gender'];
  phone: string;
  contactEmail: string;
  loginEmail: string;
  registrationNumber: string;
  admissionDate: string;
  course: string;
  academicYear: string;
  college?: string;
  fullAddress: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  guardianName: string;
  relationship: string;
  guardianPhone: string;
  guardianEmail?: string;
  guardianAddress?: string;
  profilePhotoObjectKey?: string;
  documentUploads?: RegisterStudentDocumentUpload[];
};

export type RegisterStudentDocumentUpload = {
  objectKey: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
};

export function registrationFormToPayload(form: StudentRegistrationForm): RegisterStudentPayload {
  const registrationNumber = form.rollNumber.trim() || form.studentId.trim();
  return {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    dateOfBirth: form.dateOfBirth,
    gender: form.gender as StudentRegistrationForm['gender'],
    phone: form.phone.trim(),
    contactEmail: form.email.trim(),
    loginEmail: form.loginEmail.trim(),
    registrationNumber,
    admissionDate: form.admissionDate,
    course: form.course.trim(),
    academicYear: form.academicYear.trim(),
    college: form.college.trim() || undefined,
    fullAddress: form.fullAddress.trim(),
    city: form.city.trim(),
    state: form.state.trim(),
    pinCode: form.pinCode.trim(),
    country: form.country.trim() || 'India',
    guardianName: form.guardianName.trim(),
    relationship: form.relationship.trim(),
    guardianPhone: form.guardianPhone.trim(),
    guardianEmail: form.guardianEmail.trim() || undefined,
    guardianAddress: form.guardianAddress.trim() || undefined,
    profilePhotoObjectKey: form.profilePhotoObjectKey.trim() || undefined,
    documentUploads:
      form.documentUploads.length > 0
        ? form.documentUploads.map((d) => ({
            objectKey: d.objectKey,
            fileName: d.fileName,
            mimeType: d.mimeType,
            fileSize: d.fileSize,
          }))
        : undefined,
  };
}

export async function registerStudent(
  form: StudentRegistrationForm,
): Promise<{ ok: boolean; message: string; userId?: string }> {
  const payload = registrationFormToPayload(form);
  const response = await apiFetchMutating('/api/v1/students/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const parsed = await parseApiResponse<{ student: { userId: string } }>(response);
  if (!parsed.ok) {
    return { ok: false, message: parsed.message };
  }
  return {
    ok: true,
    message: parsed.message,
    userId: parsed.data.student.userId,
  };
}
