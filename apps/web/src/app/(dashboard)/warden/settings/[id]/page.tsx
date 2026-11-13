import { WardenSettingsDetailRoute } from '@/components/dashboard/warden/settings/warden-settings-detail-route';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return createPrivatePageMetadata('Settings panel', 'Policy editor and change log.', `/warden/settings/${id}`);
}

export default async function WardenSettingsDetailPageRoute({ params }: PageProps) {
  const { id } = await params;
  return <WardenSettingsDetailRoute panelId={id} />;
}
