import { StaffReportPage } from '@/components/dashboard/staff-portal/report/staff-report-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Report an Issue',
  'Log safety, maintenance, and security issues to the warden incidents desk.',
  '/staff/report',
);

export default function StaffReportRoute() {
  return <StaffReportPage />;
}