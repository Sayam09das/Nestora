import { notFound } from 'next/navigation';

import { AdminLeaveDetailPage } from '@/components/dashboard/leave/admin-leave-detail-page';
import { getLeaveById } from '@/components/dashboard/leave/admin-leave-data';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const record = getLeaveById(id);
  const title = record ? `${record.leaveRef} · ${record.studentName}` : 'Leave details';
  return createPrivatePageMetadata(title, `${title} — Nestora admin.`, `/admin/leave/${id}`);
}

export default async function AdminLeaveDetailRoute({ params }: PageProps) {
  const { id } = await params;
  const record = getLeaveById(id);
  if (!record) {
    notFound();
  }
  return <AdminLeaveDetailPage record={record} />;
}
