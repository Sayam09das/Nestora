import { StaffSettingsPage } from '@/components/dashboard/staff-portal/settings/staff-settings-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Settings',
  'Staff notification preferences, security sessions, and workspace options.',
  '/staff/settings',
);

export default function StaffSettingsRoute() {
  return <StaffSettingsPage />;
}