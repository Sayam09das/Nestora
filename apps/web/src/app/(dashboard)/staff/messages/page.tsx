import { StaffMessagesPage } from '@/components/dashboard/staff-portal/messages/staff-messages-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Messages',
  'Live notices and work alerts for hostel staff.',
  '/staff/messages',
);

export default function StaffMessagesRoute() {
  return <StaffMessagesPage />;
}