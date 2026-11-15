import { apiFetch } from '@/lib/api/client';
import { parseApiResponse } from '@/lib/api/parse-response';

export type AdmissionVerificationRow = {
  id: string;
  tier: string;
  tierLabel: string;
  decision: string;
  comments: string | null;
  verifiedAt: string;
  actorName: string;
};

export type StudentAdmissionProfile = {
  applicationId: string | null;
  status: string | null;
  statusLabel: string;
  hostelId: string | null;
  hostelName: string | null;
  academicSession: string | null;
  tier2Pending: boolean;
  tier1Complete: boolean;
  fullyApproved: boolean;
  rejected: boolean;
  verificationHistory: AdmissionVerificationRow[];
};

export async function postAdmissionTier2Verification(
  applicationId: string,
  payload: { decision: 'APPROVED' | 'REJECTED'; comments?: string },
): Promise<{ admission?: StudentAdmissionProfile; error?: string }> {
  const response = await apiFetch(
    `/api/v1/admissions/applications/${encodeURIComponent(applicationId)}/tier-2`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  );
  const parsed = await parseApiResponse<{ admission: StudentAdmissionProfile }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { admission: parsed.data.admission };
}