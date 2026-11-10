import { notFound } from 'next/navigation';

import { AdminComplaintsDetailPage } from '@/components/dashboard/complaints/admin-complaints-detail-page';
import { getComplaintById } from '@/components/dashboard/complaints/admin-complaints-data';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const record = getComplaintById(id);
  const title = record ? `${record.ticketNumber} · ${record.title}` : 'Ticket details';
  return createPrivatePageMetadata(title, `${title} — Nestora admin.`, `/admin/complaints/${id}`);
}

export default async function AdminComplaintDetailRoute({ params }: PageProps) {
  const { id } = await params;
  const record = getComplaintById(id);
  if (!record) {
    notFound();
  }
  return <AdminComplaintsDetailPage ticket={record} />;
}
