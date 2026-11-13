import type { ApiErrorResponse, ApiSuccessResponse } from '@nestora/types';
import type { StaffRecord, StaffStatus } from '@/components/dashboard/staff/admin-staff-data';
import type {
  StaffDocumentUpload,
  StaffRegistrationForm,
} from '@/components/dashboard/staff/admin-staff-registration-constants';
import { apiFetch, apiFetchMutating } from '@/lib/api/client';
import { parseApiResponse } from '@/lib/api/parse-response';

export type StaffDirectoryWorkforceBreakdown = {
  wardens: number;
  security: number;
  administrative: number;
  housekeeping: number;
  maintenance: number;
  otherStaff: number;
};

export type StaffDirectorySummary = {
  generatedAt: string;
  total: number;
  active: number;
  onLeave: number;
  inactive: number;
  activeRatePercent: number | null;
  createdThisMonth: number;
  workforce?: StaffDirectoryWorkforceBreakdown;
  facets: {
    roles: string[];
    departments: string[];
    hostels: string[];
    hostelOptions?: Array<{ id: string; name: string }>;
  };
};

type DirectoryRowPayload = {
  id: string;
  staffId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  hostel: string;
  status: StaffStatus;
  joinedDate: string;
  profilePhotoUrl?: string | null;
};

function toStaffRecord(row: DirectoryRowPayload): StaffRecord {
  return { ...row };
}

export async function fetchStaffDirectorySummary(variant: 'all' | 'wardens' = 'all'): Promise<{
  summary?: StaffDirectorySummary;
  error?: string;
}> {
  const search = variant === 'wardens' ? '?variant=wardens' : '';
  const response = await apiFetch(`/api/v1/staff/directory/summary${search}`);
  const parsed = await parseApiResponse<{ summary: StaffDirectorySummary }>(response);
  if (!parsed.ok) {
    return { error: parsed.message };
  }
  return { summary: parsed.data.summary };
}

export type StaffDirectoryListParams = {
  page: number;
  limit: number;
  q?: string;
  status?: StaffStatus;
  role?: string;
  department?: string;
  hostel?: string;
  variant?: 'all' | 'wardens';
};

export async function fetchStaffDirectoryList(
  params: StaffDirectoryListParams,
): Promise<{
  staff?: StaffRecord[];
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
  if (params.role && params.role !== 'All Roles') {
    search.set('role', params.role);
  }
  if (params.department && params.department !== 'All Departments') {
    search.set('department', params.department);
  }
  if (params.hostel && params.hostel !== 'All Locations') {
    search.set('hostel', params.hostel);
  }
  if (params.variant === 'wardens') {
    search.set('variant', 'wardens');
  }

  const response = await apiFetch(`/api/v1/staff/directory?${search.toString()}`);
  let body: ApiSuccessResponse<{ staff: DirectoryRowPayload[] }> | ApiErrorResponse;
  try {
    body = (await response.json()) as typeof body;
  } catch {
    return { error: `Request failed (${response.status}).` };
  }
  if (!body.success) {
    return { error: body.error.message };
  }
  return {
    staff: body.data.staff.map(toStaffRecord),
    total: body.meta?.pagination?.total_records,
  };
}

export function registrationFormToStaffPayload(form: StaffRegistrationForm) {
  return {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    dateOfBirth: form.dateOfBirth,
    phone: form.phone.trim(),
    contactEmail: form.email.trim(),
    loginEmail: form.loginEmail.trim(),
    employeeNumber: form.employeeId.trim(),
    jobTitle: form.jobTitle.trim(),
    department: form.department.trim(),
    employmentType: form.employmentType.trim(),
    joiningDate: form.joiningDate,
    workShift: form.workShift.trim(),
    assignedHostel: form.assignedHostel.trim() || undefined,
    fullAddress: form.fullAddress.trim(),
    city: form.city.trim(),
    state: form.state.trim(),
    pinCode: form.pinCode.trim(),
    country: form.country.trim() || 'India',
    emergencyContactName: form.emergencyContactName.trim(),
    emergencyRelationship: form.emergencyRelationship.trim(),
    emergencyContactPhone: form.emergencyContactPhone.trim(),
    identityProofType: form.identityProofType.trim(),
    identityProofNumber: form.identityProofNumber.trim(),
    accountStatus: form.accountStatus as 'Active' | 'Pending' | 'Inactive',
    sendInvitation: form.sendInvitation,
    profilePhotoObjectKey: form.profilePhotoObjectKey.trim() || undefined,
    documentUploads:
      form.documentUploads.length > 0
        ? form.documentUploads.map((d: StaffDocumentUpload) => ({
            kind: d.kind,
            objectKey: d.objectKey,
            fileName: d.fileName,
            mimeType: d.mimeType,
            fileSize: d.fileSize,
          }))
        : undefined,
  };
}

export type AdminStaffProfile = {
  userId: string;
  directoryStatus: StaffStatus;
  profilePhotoUrl: string | null;
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
    systemRole: string;
    systemRoleLabel: string;
  };
  staff: null | {
    id: string;
    employeeNumber: string | null;
    designation: string;
    department: string;
    shiftPreference: string | null;
    employmentType: string | null;
    joiningDate: string | null;
    identityProofType: string | null;
    identityProofNumber: string | null;
    emergencyContactName: string | null;
    emergencyRelationship: string | null;
    emergencyContactPhone: string | null;
    permanentAddress: string | null;
    documents: Array<{
      id: string;
      kind: string;
      fileName: string;
      mimeType: string;
      fileSize: number;
      uploadedAt: string;
      objectKey: string;
    }>;
  };
  assignment: null | {
    hostelName: string;
    assignedAt: string;
  };
  assignments: Array<{
    hostelId: string;
    hostelName: string;
    assignedAt: string;
  }>;
  wardenOf: string | null;
  wardenInCharge: Array<{ hostelId: string; hostelName: string }>;
};

export async function fetchAdminStaffProfile(userId: string): Promise<{
  profile?: AdminStaffProfile;
  error?: string;
}> {
  const response = await apiFetch(`/api/v1/staff/${encodeURIComponent(userId)}/profile`);
  const parsed = await parseApiResponse<{ profile: AdminStaffProfile }>(response);
  if (!parsed.ok) {
    return { error: parsed.message };
  }
  return { profile: parsed.data.profile };
}

export async function updateStaffHostelAssignments(
  userId: string,
  hostelIds: string[],
): Promise<{ profile?: AdminStaffProfile; error?: string }> {
  const response = await apiFetchMutating(
    `/api/v1/staff/${encodeURIComponent(userId)}/hostel-assignments`,
    {
      method: 'PATCH',
      body: JSON.stringify({ hostelIds }),
    },
  );
  const parsed = await parseApiResponse<{ profile: AdminStaffProfile }>(response);
  if (!parsed.ok) {
    return { error: parsed.message };
  }
  return { profile: parsed.data.profile };
}

export async function registerStaff(
  form: StaffRegistrationForm,
): Promise<{ ok: boolean; message: string; userId?: string }> {
  const payload = registrationFormToStaffPayload(form);
  const response = await apiFetchMutating('/api/v1/staff/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const parsed = await parseApiResponse<{ staff: { userId: string } }>(response);
  if (!parsed.ok) {
    return { ok: false, message: parsed.message };
  }
  return {
    ok: true,
    message: 'Staff member registered.',
    userId: parsed.data.staff.userId,
  };
}
