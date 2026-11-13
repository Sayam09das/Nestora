import { AdminAnnouncementsDetailRoute } from '@/components/dashboard/announcements/admin-announcements-detail-route';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return createPrivatePageMetadata('Notice', 'Announcement detail and acknowledgement roster.', `/warden/announcements/${id}`);
}

export default async function WardenAnnouncementDetailPageRoute({ params }: PageProps) {
  const { id } = await params;
  return <AdminAnnouncementsDetailRoute noticeId={id} listHref="/warden/announcements" />;
}
