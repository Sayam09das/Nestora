import { AdminFeesDetailRoute } from '@/components/dashboard/fees/admin-fees-detail-route';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return createPrivatePageMetadata('Student ledger', 'Hostel fee ledger statement.', `/admin/fees/${id}`);
}

export default async function AdminFeesDetailPageRoute({ params }: PageProps) {
  const { id } = await params;
  return <AdminFeesDetailRoute ledgerId={id} />;
}
