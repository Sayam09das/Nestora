import { StudentSettingsPage } from '@/components/dashboard/student-portal/settings/student-settings-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Settings',
  'Notification preferences, security, and workspace options for students.',
  '/student/settings',
);

export default function StudentSettingsRoute() {
  return <StudentSettingsPage />;
}