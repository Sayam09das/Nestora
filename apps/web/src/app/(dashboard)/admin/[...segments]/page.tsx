import { AdminSectionPlaceholder } from '@/components/dashboard/admin-section-placeholder';
import { getAdminSectionLabelFromPath } from '@/components/dashboard/admin-route-meta';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

type PageProps = {
  params: Promise<{ segments: string[] }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { segments } = await params;
  const pathname = `/admin/${segments.join('/')}`;
  const title = getAdminSectionLabelFromPath(pathname);
  return createPrivatePageMetadata(title, `${title} — Nestora admin console.`, pathname);
}

export default async function AdminSegmentPage({ params }: PageProps) {
  const { segments } = await params;
  const pathname = `/admin/${segments.join('/')}`;

  return <AdminSectionPlaceholder pathname={pathname} />;
}
