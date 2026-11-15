import type { ApiErrorResponse, ApiSuccessResponse } from '@nestora/types';
import type { LedgerAccount, LedgerLine } from '@/components/dashboard/fees/admin-fees-data';
import { apiFetch } from '@/lib/api/client';
import { parseApiResponse } from '@/lib/api/parse-response';

export type FinanceDeskSummary = {
  generatedAt: string;
  collectedMonth: number;
  collectedMonthLabel: string;
  outstandingTotal: number;
  pendingApprovals: number;
  activeSchedules: number;
  remindersQueued: number;
  facets: { hostels: string[] };
};

export type FinanceCollectionTrendPoint = {
  month: string;
  collected: number;
  outstanding: number;
};

export type FinancePendingWaiver = {
  id: string;
  student: string;
  amount: number;
  reason: string;
  status: string;
  frRef: string;
};

export async function fetchFinanceDeskSummary(): Promise<{
  summary?: FinanceDeskSummary;
  error?: string;
}> {
  const response = await apiFetch('/api/v1/finance/desk/summary');
  const parsed = await parseApiResponse<{ summary: FinanceDeskSummary }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { summary: parsed.data.summary };
}

export async function fetchFinanceDeskLedgers(params: {
  page?: number;
  limit?: number;
  q?: string;
  hostel?: string;
  status?: string;
}): Promise<{
  ledgers?: LedgerAccount[];
  collectionTrend?: FinanceCollectionTrendPoint[];
  total?: number;
  error?: string;
}> {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  if (params.q?.trim()) search.set('q', params.q.trim());
  if (params.hostel && params.hostel !== 'All hostels') search.set('hostel', params.hostel);
  if (params.status && params.status !== 'All status') search.set('status', params.status);

  const response = await apiFetch(`/api/v1/finance/desk/ledgers?${search}`);
  let body: ApiSuccessResponse<{
    ledgers: LedgerAccount[];
    collectionTrend: FinanceCollectionTrendPoint[];
  }> | ApiErrorResponse;
  try {
    body = (await response.json()) as typeof body;
  } catch {
    return { error: `Request failed (${response.status}).` };
  }
  if (!body.success) return { error: body.error.message };
  return {
    ledgers: body.data.ledgers,
    collectionTrend: body.data.collectionTrend,
    total: body.meta?.pagination?.total_records,
  };
}

export async function fetchFinanceLedgerDetail(ledgerId: string): Promise<{
  account?: LedgerAccount;
  lines?: LedgerLine[];
  pendingWaivers?: FinancePendingWaiver[];
  error?: string;
}> {
  const response = await apiFetch(`/api/v1/finance/desk/ledgers/${encodeURIComponent(ledgerId)}`);
  const parsed = await parseApiResponse<{
    account: LedgerAccount;
    lines: LedgerLine[];
    pendingWaivers: FinancePendingWaiver[];
  }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return {
    account: parsed.data.account,
    lines: parsed.data.lines,
    pendingWaivers: parsed.data.pendingWaivers,
  };
}

export async function postOfflinePayment(payload: {
  ledgerId: string;
  amount: number;
  paymentMode: 'CASH' | 'DD' | 'NEFT' | 'UPI';
  transactionReference: string;
  paymentDate: string;
}): Promise<{ receiptNumber?: string; outstanding?: number; error?: string }> {
  const response = await apiFetch('/api/v1/finance/desk/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const parsed = await parseApiResponse<{ receiptNumber: string; outstanding: number }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { receiptNumber: parsed.data.receiptNumber, outstanding: parsed.data.outstanding };
}

export async function postProposeFeeWaiver(payload: {
  ledgerId: string;
  amount: number;
  reason: string;
}): Promise<{ adjustmentId?: string; error?: string }> {
  const response = await apiFetch('/api/v1/finance/desk/waivers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const parsed = await parseApiResponse<{ adjustmentId: string }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { adjustmentId: parsed.data.adjustmentId };
}

export async function postPaymentReminder(ledgerId: string): Promise<{ notified?: boolean; error?: string }> {
  const response = await apiFetch(`/api/v1/finance/desk/ledgers/${encodeURIComponent(ledgerId)}/reminder`, {
    method: 'POST',
  });
  const parsed = await parseApiResponse<{ notified: boolean }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { notified: parsed.data.notified };
}

export async function postAssessLedgerFromSchedule(
  ledgerId: string,
): Promise<{ assessed?: number; outstanding?: number; error?: string }> {
  const response = await apiFetch(`/api/v1/finance/desk/ledgers/${encodeURIComponent(ledgerId)}/assess`, {
    method: 'POST',
  });
  const parsed = await parseApiResponse<{ assessed: number; outstanding: number }>(response);
  if (!parsed.ok) return { error: parsed.message };
  return { assessed: parsed.data.assessed, outstanding: parsed.data.outstanding };
}

export async function postFeeWaiverDecision(
  adjustmentId: string,
  payload: { decision: 'APPROVED' | 'REJECTED'; remarks?: string },
): Promise<{ error?: string }> {
  const response = await apiFetch(
    `/api/v1/finance/desk/adjustments/${encodeURIComponent(adjustmentId)}/decide`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  );
  const parsed = await parseApiResponse(response);
  if (!parsed.ok) return { error: parsed.message };
  return {};
}
