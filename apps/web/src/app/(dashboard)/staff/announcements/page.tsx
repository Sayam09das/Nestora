import { StaffAnnouncementsPage } from '@/components/dashboard/staff-portal/announcements/staff-announcements-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Announcements',
  'Live hostel and university notices for staff.',
  '/staff/announcements',
);

export default function StaffAnnouncementsRoute() {
  return <StaffAnnouncementsPage />;
}