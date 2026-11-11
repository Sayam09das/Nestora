import { WardenStudentsPage } from '@/components/dashboard/warden/students/warden-students-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Student Management',
  'Hostel-scoped resident directory and tier-2 admission queue for wardens.',
  '/warden/students',
);

export default function WardenStudentsRoute() {
  return <WardenStudentsPage />;
}
