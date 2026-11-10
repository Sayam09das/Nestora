import { AdminAuditLogsDetailPage } from '@/components/dashboard/audit-logs/admin-audit-logs-detail-page';
import { getAuditLogById } from '@/components/dashboard/audit-logs/admin-audit-logs-data';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const record = getAuditLogById(id);
  const title = record ? record.actionName : 'Audit entry';
  return createPrivatePageMetadata(title, `${title} — Nestora audit trail.`, `/admin/audit-logs/${id}`);
}

export default async function AdminAuditLogDetailRoute({ params }: PageProps) {
  const { id } = await params;
  const initial = getAuditLogById(id);
  return <AdminAuditLogsDetailPage id={id} initialLog={initial} />;
}
