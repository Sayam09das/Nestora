import { StudentAnnouncementsPage } from '@/components/dashboard/student-portal/announcements/student-announcements-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';
import { Suspense } from 'react';

export const metadata = createPrivatePageMetadata(
  'Announcements',
  'Hostel notices, circulars, and mandatory acknowledgements.',
  '/student/announcements',
);

export default function StudentAnnouncementsRoute() {
  return (
    <Suspense fallback={null}>
      <StudentAnnouncementsPage />
    </Suspense>
  );
}