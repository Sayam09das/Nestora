import { AdminSettingsDetailRoute } from '@/components/dashboard/settings/admin-settings-detail-route';
import { getSettingsPanelById } from '@/components/dashboard/settings/admin-settings-data';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const record = getSettingsPanelById(id);
  const title = record ? record.title : 'Settings panel';
  return createPrivatePageMetadata(title, `${title} — Nestora admin.`, `/admin/settings/${id}`);
}

export default async function AdminSettingsPanelRoute({ params }: PageProps) {
  const { id } = await params;
  return <AdminSettingsDetailRoute panelId={id} />;
}
