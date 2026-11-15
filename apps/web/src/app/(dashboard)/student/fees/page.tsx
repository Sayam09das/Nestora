import { StudentFeesPage } from '@/components/dashboard/student-portal/fees/student-fees-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Fee & Payments',
  'View hostel fee balance, payment receipts, and schedule breakdown.',
  '/student/fees',
);

export default function StudentFeesRoute() {
  return <StudentFeesPage />;
}