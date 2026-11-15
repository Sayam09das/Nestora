import { StudentMessagesPage } from '@/components/dashboard/student-portal/messages/student-messages-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Messages',
  'Student inbox for hostel announcements and office updates.',
  '/student/messages',
);

export default function StudentMessagesRoute() {
  return <StudentMessagesPage />;
}