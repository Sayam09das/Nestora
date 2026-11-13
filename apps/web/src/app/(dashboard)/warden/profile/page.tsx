import { WardenProfilePage } from '@/components/dashboard/warden/profile/warden-profile-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'My Profile',
  'Warden account, contact details, hostel assignment, and live session security.',
  '/warden/profile',
);

export default function WardenProfileRoute() {
  return <WardenProfilePage />;
}
