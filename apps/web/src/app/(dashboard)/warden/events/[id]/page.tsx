import { AdminAnnouncementsDetailRoute } from '@/components/dashboard/announcements/admin-announcements-detail-route';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return createPrivatePageMetadata('Event notice', 'Event and activity notice details.', `/warden/events/${id}`);
}

export default async function WardenEventDetailPageRoute({ params }: PageProps) {
  const { id } = await params;
  return <AdminAnnouncementsDetailRoute noticeId={id} listHref="/warden/events" />;
}
