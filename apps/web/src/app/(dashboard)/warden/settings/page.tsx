import { WardenSettingsPage } from '@/components/dashboard/warden/settings/warden-settings-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Settings',
  'Hostel-scoped operational policies and notification preferences for wardens.',
  '/warden/settings',
);

export default function WardenSettingsRoute() {
  return <WardenSettingsPage />;
}
