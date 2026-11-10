import { notFound } from 'next/navigation';

import { AdminFeesDetailPage } from '@/components/dashboard/fees/admin-fees-detail-page';
import { getLedgerById } from '@/components/dashboard/fees/admin-fees-data';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const record = getLedgerById(id);
  const title = record ? `${record.studentName} · Ledger` : 'Student ledger';
  return createPrivatePageMetadata(title, `${title} — Nestora admin.`, `/admin/fees/${id}`);
}

export default async function AdminFeesDetailRoute({ params }: PageProps) {
  const { id } = await params;
  const record = getLedgerById(id);
  if (!record) {
    notFound();
  }
  return <AdminFeesDetailPage account={record} />;
}
