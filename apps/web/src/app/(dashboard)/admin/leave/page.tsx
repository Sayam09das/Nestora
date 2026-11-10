import { AdminLeavePage } from '@/components/dashboard/leave/admin-leave-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Leave Requests',
  'Review temporary leave, extensions, and gate passes while retaining bed allocation.',
  '/admin/leave',
);

export default function AdminLeaveListPage() {
  return <AdminLeavePage />;
}
