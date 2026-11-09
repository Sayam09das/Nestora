import { AdminStudentsPage } from '@/components/dashboard/students/admin-students-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'All Students',
  'Search, filter, and manage the university student directory.',
  '/admin/students',
);

export default function AdminStudentsListPage() {
  return <AdminStudentsPage />;
}
