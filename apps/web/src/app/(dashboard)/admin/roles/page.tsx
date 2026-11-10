import { AdminRolesPage } from '@/components/dashboard/roles/admin-roles-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Roles & Permissions',
  'Manage the six institutional roles, permission matrices, and scoped grants.',
  '/admin/roles',
);

export default function AdminRolesListPage() {
  return <AdminRolesPage />;
}
