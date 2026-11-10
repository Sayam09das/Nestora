import { notFound } from 'next/navigation';

import { AdminReportsDetailPage } from '@/components/dashboard/reports/admin-reports-detail-page';
import { getReportById } from '@/components/dashboard/reports/admin-reports-data';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const record = getReportById(id);
  const title = record ? record.title : 'Report details';
  return createPrivatePageMetadata(title, `${title} — Nestora admin.`, `/admin/reports/${id}`);
}

export default async function AdminReportDetailRoute({ params }: PageProps) {
  const { id } = await params;
  const record = getReportById(id);
  if (!record) {
    notFound();
  }
  return <AdminReportsDetailPage report={record} />;
}
