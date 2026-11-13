import { AdminComplaintsDetailRoute } from '@/components/dashboard/complaints/admin-complaints-detail-route';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return createPrivatePageMetadata('Maintenance ticket', 'Complaint ticket details.', `/admin/complaints/${id}`);
}

export default async function AdminComplaintDetailPageRoute({ params }: PageProps) {
  const { id } = await params;
  return <AdminComplaintsDetailRoute ticketId={id} />;
}
