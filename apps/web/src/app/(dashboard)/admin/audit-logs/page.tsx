import { AdminAuditLogsPage } from '@/components/dashboard/audit-logs/admin-audit-logs-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Activity Logs',
  'Inspect immutable audit entries for administrative and security actions.',
  '/admin/audit-logs',
);

export default function AdminAuditLogsListPage() {
  return <AdminAuditLogsPage />;
}
