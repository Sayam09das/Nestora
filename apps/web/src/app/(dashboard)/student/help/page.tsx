import { StudentHelpPage } from '@/components/dashboard/student-portal/help/student-help-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Help & Support',
  'Student portal FAQ, warden contacts, and support requests.',
  '/student/help',
);

export default function StudentHelpRoute() {
  return <StudentHelpPage />;
}