import { StaffProfilePage } from '@/components/dashboard/staff-portal/profile/staff-profile-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'My Profile',
  'Staff account details, employment record, and active sessions.',
  '/staff/profile',
);

export default function StaffProfileRoute() {
  return <StaffProfilePage />;
}