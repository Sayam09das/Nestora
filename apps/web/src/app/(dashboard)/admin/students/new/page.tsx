import { AdminStudentsNewPage } from '@/components/dashboard/students/admin-students-new-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Add Student',
  'Register a new student and assign hostel accommodation.',
  '/admin/students/new',
);

export default function AdminStudentsNewRoutePage() {
  return <AdminStudentsNewPage />;
}
