import { AdminComplaintsDetailRoute } from '@/components/dashboard/complaints/admin-complaints-detail-route';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return createPrivatePageMetadata('Maintenance work order', 'Repair ticket details.', `/warden/maintenance/${id}`);
}

export default async function WardenMaintenanceDetailPageRoute({ params }: PageProps) {
  const { id } = await params;
  return <AdminComplaintsDetailRoute ticketId={id} listHref="/warden/maintenance" />;
}
