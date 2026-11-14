import { AdminAnnouncementsDetailRoute } from '@/components/dashboard/announcements/admin-announcements-detail-route';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return createPrivatePageMetadata('Notice', 'Announcement detail.', `/staff/announcements/${id}`);
}

export default async function StaffAnnouncementDetailPageRoute({ params }: PageProps) {
  const { id } = await params;
  return <AdminAnnouncementsDetailRoute noticeId={id} listHref="/staff/announcements" />;
}