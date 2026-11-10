import { AdminSettingsPage } from '@/components/dashboard/settings/admin-settings-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Settings',
  'Configure institution parameters, thresholds, and notification policy.',
  '/admin/settings',
);

export default function AdminSettingsListPage() {
  return <AdminSettingsPage />;
}
