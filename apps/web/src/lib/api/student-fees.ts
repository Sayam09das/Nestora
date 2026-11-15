import { apiFetch } from '@/lib/api/client';
import { parseApiResponse } from '@/lib/api/parse-response';

export type StudentFeeAccountStatus = 'cleared' | 'current' | 'due' | 'no_ledger';

export type StudentFeePayment = {
  id: string;
  receiptNumber: string;
  amount: number;
  paymentMode: string;
  paymentModeLabel: string;
  transactionReference: string;
  paymentDate: string;
  recordedAt: string;
};

export type StudentFeeLineItem = {
  id: string;
  itemName: string;
  amount: number;
};

export type StudentFeeAdjustmentRow = {
  id: string;
  adjustmentType: string;
  adjustmentTypeLabel: string;
  amount: number;
  reason: string;
  status: string;
  statusLabel: string;
  createdAt: string;
};

export type StudentFeesDesk = {
  generatedAt: string;
  profileLinked: boolean;
  hostelName: string | null;
  registrationNumber: string | null;
  summary: {
    totalAssessed: number;
    totalPaid: number;
    totalWaived: number;
    outstanding: number;
    dueDateLabel: string;
    accountStatus: StudentFeeAccountStatus;
    accountStatusLabel: string;
    paidPercent: number;
    lastRecalculated: string | null;
  };
  schedule: {
    id: string;
    title: string;
    semester: string;
    academicSession: string;
    items: StudentFeeLineItem[];
    itemsTotal: number;
  } | null;
  payments: StudentFeePayment[];
  adjustments: StudentFeeAdjustmentRow[];
  payOnlineAvailable: boolean;
  payOnlineNote: string;
};

export async function fetchStudentFeesDesk(): Promise<{
  desk?: StudentFeesDesk;
  error?: string;
}> {
  const response = await apiFetch('/api/v1/dashboard/student/fees');
  const parsed = await parseApiResponse<{ desk: StudentFeesDesk }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { desk: parsed.data.desk };
}