import { notFound } from 'next/navigation';

import { AdminAnnouncementsDetailPage } from '@/components/dashboard/announcements/admin-announcements-detail-page';
import { getAnnouncementById } from '@/components/dashboard/announcements/admin-announcements-data';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const record = getAnnouncementById(id);
  const title = record ? record.title : 'Notice details';
  return createPrivatePageMetadata(title, `${title} — Nestora admin.`, `/admin/announcements/${id}`);
}

export default async function AdminAnnouncementDetailRoute({ params }: PageProps) {
  const { id } = await params;
  const record = getAnnouncementById(id);
  if (!record) {
    notFound();
  }
  return <AdminAnnouncementsDetailPage notice={record} />;
}
