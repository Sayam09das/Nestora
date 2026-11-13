import { AdminRolesDetailRoute } from '@/components/dashboard/roles/admin-roles-detail-route';
import { getRoleById } from '@/components/dashboard/roles/admin-roles-data';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const record = getRoleById(id);
  const title = record ? record.title : 'Role details';
  return createPrivatePageMetadata(title, `${title} — Nestora admin.`, `/admin/roles/${id}`);
}

export default async function AdminRolePanelRoute({ params }: PageProps) {
  const { id } = await params;
  return <AdminRolesDetailRoute roleId={id} />;
}
