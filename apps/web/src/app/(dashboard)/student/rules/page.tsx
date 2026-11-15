import { StudentRulesPage } from '@/components/dashboard/student-portal/rules/student-rules-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Hostel Rules & Policies',
  'University-wide and hostel-specific conduct policies for residents.',
  '/student/rules',
);

export default function StudentRulesRoute() {
  return <StudentRulesPage />;
}