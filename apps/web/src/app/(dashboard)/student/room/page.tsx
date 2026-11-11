import { StudentRoomPage } from '@/components/dashboard/student-portal/room/student-room-page';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

export const metadata = createPrivatePageMetadata(
  'My Room & Bed',
  'View your hostel allocation, room, bed, and roommates.',
  '/student/room',
);

export default function StudentRoomRoute() {
  return <StudentRoomPage />;
}
