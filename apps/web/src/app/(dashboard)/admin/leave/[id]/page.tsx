import { AdminLeaveDetailRoute } from '@/components/dashboard/leave/admin-leave-detail-route';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return createPrivatePageMetadata('Leave application', 'Leave request details.', `/admin/leave/${id}`);
}

export default async function AdminLeaveDetailPageRoute({ params }: PageProps) {
  const { id } = await params;
  return <AdminLeaveDetailRoute leaveId={id} />;
}
