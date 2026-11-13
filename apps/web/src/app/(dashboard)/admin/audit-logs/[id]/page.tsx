import { AdminAuditLogsDetailRoute } from '@/components/dashboard/audit-logs/admin-audit-logs-detail-route';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return createPrivatePageMetadata('Audit entry', `Audit entry ${id} — Nestora audit trail.`, `/admin/audit-logs/${id}`);
}

export default async function AdminAuditLogDetailRoute({ params }: PageProps) {
  const { id } = await params;
  return <AdminAuditLogsDetailRoute auditLogId={id} />;
}
