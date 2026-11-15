import { StudentEmergencyPage } from '@/components/dashboard/student-portal/emergency/student-emergency-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Emergency Contacts',
  'Guardian, warden, and campus emergency numbers with incident reporting.',
  '/student/emergency',
);

export default function StudentEmergencyRoute() {
  return <StudentEmergencyPage />;
}