import { StudentGatePassesPage } from '@/components/dashboard/student-portal/gate-passes/student-gate-passes-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'Gate Passes',
  'Student digital gate passes for approved hostel leave.',
  '/student/gate-passes',
);

export default function StudentGatePassesRoute() {
  return <StudentGatePassesPage />;
}