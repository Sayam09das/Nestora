import { parseApiResponse } from '@/lib/api/parse-response';
import { apiFetch, apiFetchMutating } from '@/lib/api/client';

export type StudentSelfProfileDesk = {
  generatedAt: string;
  profileLinked: boolean;
  account: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    status: string;
    isVerified: boolean;
    mfaEnabled: boolean;
    profilePhotoUrl: string | null;
    lastLoginAt: string | null;
  };
  academic: {
    registrationNumber: string;
    department: string;
    course: string;
    currentSemester: string;
    academicYear: string;
    admissionYear: string;
    status: string;
  };
  personal: {
    gender: string;
    dateOfBirth: string;
    bloodGroup: string | null;
    permanentAddress: string;
    identityVerified: boolean;
  };
  guardian: {
    name: string;
    relationship: string;
    primaryPhone: string;
    alternatePhone: string | null;
    address: string;
  };
  hostel: {
    allocated: boolean;
    hostelName: string | null;
    block: string | null;
    roomNumber: string | null;
    bedNumber: string | null;
    roomType: string | null;
    allocationDate: string | null;
  };
  documents: Array<{
    id: string;
    name: string;
    status: 'verified' | 'pending';
    uploadedAt: string;
  }>;
  security: {
    activeSessions: number;
  };
};

export async function fetchStudentProfileDesk(): Promise<{
  desk?: StudentSelfProfileDesk;
  error?: string;
}> {
  const response = await apiFetch('/api/v1/dashboard/student/profile');
  const parsed = await parseApiResponse<{ desk: StudentSelfProfileDesk }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { desk: parsed.data.desk };
}

export async function patchStudentProfileDesk(body: {
  phone?: string;
  permanentAddress?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianRelation?: string;
  profilePhotoObjectKey?: string;
}): Promise<{ desk?: StudentSelfProfileDesk; error?: string }> {
  const response = await apiFetchMutating('/api/v1/dashboard/student/profile', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  const parsed = await parseApiResponse<{ desk: StudentSelfProfileDesk }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { desk: parsed.data.desk };
}