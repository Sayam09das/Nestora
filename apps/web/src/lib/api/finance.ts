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
