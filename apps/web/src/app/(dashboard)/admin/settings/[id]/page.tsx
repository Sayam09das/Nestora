import { notFound } from 'next/navigation';

import { AdminSettingsDetailPage } from '@/components/dashboard/settings/admin-settings-detail-page';
import { getSettingsPanelById } from '@/components/dashboard/settings/admin-settings-data';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const record = getSettingsPanelById(id);
  const title = record ? record.title : 'Settings panel';
  return createPrivatePageMetadata(title, `${title} — Nestora admin.`, `/admin/settings/${id}`);
}

export default async function AdminSettingsDetailRoute({ params }: PageProps) {
  const { id } = await params;
  const record = getSettingsPanelById(id);
  if (!record) {
    notFound();
  }
  return <AdminSettingsDetailPage panel={record} />;
}
