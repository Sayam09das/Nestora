import { notFound } from 'next/navigation';

import { AdminAllocationDetailPage } from '@/components/dashboard/allocation/admin-allocation-detail-page';
import { getAllocationById } from '@/components/dashboard/allocation/admin-allocation-data';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const record = getAllocationById(id);
  const title = record ? `${record.allocationRef} · ${record.studentName}` : 'Allocation details';
  return createPrivatePageMetadata(title, `${title} — Nestora admin.`, `/admin/allocation/${id}`);
}

export default async function AdminAllocationDetailRoute({ params }: PageProps) {
  const { id } = await params;
  const record = getAllocationById(id);
  if (!record) {
    notFound();
  }
  return <AdminAllocationDetailPage record={record} />;
}
