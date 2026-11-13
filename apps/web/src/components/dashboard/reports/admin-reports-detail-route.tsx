'use client';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { AdminReportsDetailPage } from '@/components/dashboard/reports/admin-reports-detail-page';
import type { ReportTemplate } from '@/components/dashboard/reports/admin-reports-data';
import { fetchReportDeskPreview, fetchReportDeskTemplate } from '@/lib/api/reports';
import type { ReportDeskPreview } from '@/lib/api/reports';
import { Button } from '@/components/ui/button';

type DetailRouteProps = {
  reportId: string;
  listHref?: string;
  previewParams?: { hostel?: string; period?: string };
};

export function AdminReportsDetailRoute({
  reportId,
  listHref = '/admin/reports',
  previewParams,
}: DetailRouteProps) {
  const [report, setReport] = useState<ReportTemplate | null>(null);
  const [preview, setPreview] = useState<ReportDeskPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [templateResult, previewResult] = await Promise.all([
        fetchReportDeskTemplate(reportId),
        fetchReportDeskPreview(reportId, previewParams ?? { period: 'Last 30 days' }),
      ]);
      if (cancelled) return;
      if (templateResult.report) {
        setReport(templateResult.report);
        setError(null);
      } else {
        setError(templateResult.error ?? 'Report not found.');
      }
      if (previewResult.preview) setPreview(previewResult.preview);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [reportId, previewParams?.hostel, previewParams?.period]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-[var(--nestora-sage)]" aria-hidden />
        <p className="text-sm text-muted-foreground">Loading report…</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="space-y-4 py-8 text-center">
        <p className="text-sm text-destructive">{error ?? 'Report not found.'}</p>
        <Button nativeButton={false} variant="outline" className="rounded-xl" render={<Link href={listHref}>Back to reports</Link>} />
      </div>
    );
  }

  return <AdminReportsDetailPage report={report} preview={preview} listHref={listHref} />;
}
