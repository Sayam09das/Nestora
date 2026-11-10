import { notFound } from 'next/navigation';

import { AdminAttendanceDetailPage } from '@/components/dashboard/attendance/admin-attendance-detail-page';
import { getSessionById } from '@/components/dashboard/attendance/admin-attendance-data';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const session = getSessionById(id);
  const title = session ? `Attendance · ${session.hostel}` : 'Attendance session';
  return createPrivatePageMetadata(title, `${title} — Nestora admin.`, `/admin/attendance/sessions/${id}`);
}

export default async function AdminAttendanceSessionRoute({ params }: PageProps) {
  const { id } = await params;
  const session = getSessionById(id);
  if (!session) {
    notFound();
  }
  return <AdminAttendanceDetailPage session={session} />;
}
