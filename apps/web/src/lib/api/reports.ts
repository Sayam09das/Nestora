import type { ApiErrorResponse, ApiSuccessResponse } from '@nestora/types';
import type { ReportTemplate } from '@/components/dashboard/reports/admin-reports-data';
import { apiFetch } from '@/lib/api/client';

export type ReportsDeskSummary = {
  generatedAt: string;
  templates: number;
  scheduledJobs: number;
  exportsThisWeek: number;
  avgRunSeconds: number;
  dataFreshnessMin: number;
  facets: { hostels: string[]; categories: ReportTemplate['category'][] };
};

export type ReportDeskPreview = {
  reportId: string;
  generatedAt: string;
  sparkline: number[];
  chart: {
    data: Array<Record<string, string | number>>;
    dataKey: string;
    xKey: string;
  } | null;
};

export async function fetchReportsDeskSummary(): Promise<{ summary?: ReportsDeskSummary; error?: string }> {
  const response = await apiFetch('/api/v1/reports/desk/summary');
  const body = (await response.json()) as ApiSuccessResponse<{ summary: ReportsDeskSummary }> | ApiErrorResponse;
  if (!body.success) return { error: body.error.message };
  return { summary: body.data.summary };
}

export async function fetchReportsDeskTemplates(params: {
  q?: string;
  category?: string;
  hostel?: string;
  period?: string;
}): Promise<{ templates?: ReportTemplate[]; error?: string }> {
  const search = new URLSearchParams();
  if (params.q?.trim()) search.set('q', params.q.trim());
  if (params.category && params.category !== 'All Categories') search.set('category', params.category);
  if (params.hostel && params.hostel !== 'All Hostels') search.set('hostel', params.hostel);
  if (params.period) search.set('period', params.period);

  const suffix = search.toString() ? `?${search}` : '';
  const response = await apiFetch(`/api/v1/reports/desk/templates${suffix}`);
  const body = (await response.json()) as ApiSuccessResponse<{ templates: ReportTemplate[] }> | ApiErrorResponse;
  if (!body.success) return { error: body.error.message };
  return { templates: body.data.templates };
}

export async function fetchReportDeskTemplate(reportId: string): Promise<{ report?: ReportTemplate; error?: string }> {
  const response = await apiFetch(`/api/v1/reports/desk/templates/${encodeURIComponent(reportId)}`);
  const body = (await response.json()) as ApiSuccessResponse<{ report: ReportTemplate }> | ApiErrorResponse;
  if (!body.success) return { error: body.error.message };
  return { report: body.data.report };
}

export async function fetchReportDeskPreview(
  reportId: string,
  params?: { hostel?: string; period?: string },
): Promise<{ preview?: ReportDeskPreview; error?: string }> {
  const search = new URLSearchParams();
  if (params?.hostel && params.hostel !== 'All Hostels') search.set('hostel', params.hostel);
  if (params?.period) search.set('period', params.period);
  const suffix = search.toString() ? `?${search}` : '';

  const response = await apiFetch(`/api/v1/reports/desk/templates/${encodeURIComponent(reportId)}/preview${suffix}`);
  const body = (await response.json()) as ApiSuccessResponse<{ preview: ReportDeskPreview }> | ApiErrorResponse;
  if (!body.success) return { error: body.error.message };
  return { preview: body.data.preview };
}
