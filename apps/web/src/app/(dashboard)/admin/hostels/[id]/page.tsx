import { notFound } from 'next/navigation';

import { AdminHostelsDetailPage } from '@/components/dashboard/hostels/admin-hostels-detail-page';
import { getHostelById } from '@/components/dashboard/hostels/admin-hostels-data';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const record = getHostelById(id);
  const title = record?.name ?? 'Hostel details';
  return createPrivatePageMetadata(title, `${title} — Nestora admin.`, `/admin/hostels/${id}`);
}

export default async function AdminHostelDetailRoute({ params }: PageProps) {
  const { id } = await params;
  const record = getHostelById(id);
  if (!record) {
    notFound();
  }
  return <AdminHostelsDetailPage record={record} />;
}
