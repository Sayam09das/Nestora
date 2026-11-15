import { AdminFeesDetailRoute } from '@/components/dashboard/fees/admin-fees-detail-route';
import { ACCOUNTANT_FINANCE_DESK } from '@/components/dashboard/fees/finance-desk-config';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return createPrivatePageMetadata('Student ledger', 'Hostel fee ledger statement.', `/accountant/fees/${id}`);
}

export default async function AccountantFeesDetailPageRoute({ params }: PageProps) {
  const { id } = await params;
  return <AdminFeesDetailRoute ledgerId={id} backHref="/accountant/fees" desk={ACCOUNTANT_FINANCE_DESK} />;
}