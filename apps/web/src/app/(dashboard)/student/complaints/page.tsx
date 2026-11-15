import { StudentComplaintsPage } from '@/components/dashboard/student-portal/complaints/student-complaints-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';
import { Suspense } from 'react';

export const metadata = createPrivatePageMetadata(
  'Complaints',
  'Submit and track hostel maintenance and conduct complaints.',
  '/student/complaints',
);

export default function StudentComplaintsRoute() {
  return (
    <Suspense fallback={null}>
      <StudentComplaintsPage />
    </Suspense>
  );
}