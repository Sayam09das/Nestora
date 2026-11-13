import { AdminAllocationDetailRoute } from '@/components/dashboard/allocation/admin-allocation-detail-route';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return createPrivatePageMetadata(
    'Allocation details',
    'Bed assignment record and student placement.',
    `/admin/allocation/${id}`,
  );
}

export default async function AdminAllocationDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <AdminAllocationDetailRoute allocationId={id} />;
}
