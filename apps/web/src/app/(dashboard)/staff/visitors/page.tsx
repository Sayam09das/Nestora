import { StaffVisitorsPage } from '@/components/dashboard/staff-portal/visitors/staff-visitors-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Visitor & Security Log',
  'Live visitor desk for hostel staff — register, approve, check in and out.',
  '/staff/visitors',
);

export default function StaffVisitorsRoute() {
  return <StaffVisitorsPage />;
}