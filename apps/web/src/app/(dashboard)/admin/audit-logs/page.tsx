import { createPrivatePageMetadata } from '@/lib/seo/metadata';
import { AuditLogsConsole } from './audit-logs-console';

export const metadata = createPrivatePageMetadata(
  'Audit logs',
  'Inspect immutable audit entries for administrative and security actions.',
  '/admin/audit-logs',
);

export default function AdminAuditLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Audit logs</h1>
        <p className="text-muted-foreground text-sm">
          Filter by actor, action, entity, and time range. Requires an active University
          Administrator session.
        </p>
      </div>
      <AuditLogsConsole />
    </div>
  );
}
