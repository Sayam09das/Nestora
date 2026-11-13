import { WardenReportsDetailRoute } from '@/components/dashboard/warden/reports/warden-reports-detail-route';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return createPrivatePageMetadata('Report', 'Report detail, preview chart, and export.', `/warden/reports/${id}`);
}

export default async function WardenReportDetailPageRoute({ params }: PageProps) {
  const { id } = await params;
  return <WardenReportsDetailRoute reportId={id} />;
}
