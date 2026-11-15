import type { Prisma, PrismaClient } from '@nestora/database';
import type { CreateStudentMaintenanceBody } from '@nestora/validators';
import { ensureStudentProfileForUser } from '../students/student-profile-ensure.service.js';
import {
  createStudentComplaintTicket,
  getStudentComplaintsDesk,
  mapStudentComplaintTicketRow,
  type StudentComplaintTicket,
  STUDENT_COMPLAINT_PRIORITIES,
} from './student-complaints.service.js';

export const STUDENT_MAINTENANCE_CATEGORIES = [
  'Maintenance',
  'Electrical',
  'Plumbing',
  'Cleaning',
  'Internet',
] as const;

export type StudentMaintenanceDesk = {
  generatedAt: string;
  profileLinked: boolean;
  canSubmit: boolean;
  hostelName: string | null;
  defaultLocation: string | null;
  categories: readonly string[];
  priorities: readonly string[];
  summary: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
  };
  requests: StudentComplaintTicket[];
};

const maintenanceWhere = (studentId: string): Prisma.ComplaintTicketWhereInput => ({
  studentId,
  OR: [
    { category: { in: [...STUDENT_MAINTENANCE_CATEGORIES] } },
    { category: { contains: 'maintenance', mode: 'insensitive' } },
  ],
});

export async function getStudentMaintenanceDesk(
  prisma: PrismaClient,
  userId: string,
): Promise<StudentMaintenanceDesk> {
  const now = new Date();
  const base = await getStudentComplaintsDesk(prisma, userId);

  const student = await prisma.student.findUnique({ where: { userId }, select: { id: true } });
  if (!student) {
    return {
      generatedAt: now.toISOString(),
      profileLinked: false,
      canSubmit: false,
      hostelName: null,
      defaultLocation: null,
      categories: STUDENT_MAINTENANCE_CATEGORIES,
      priorities: STUDENT_COMPLAINT_PRIORITIES,
      summary: { total: 0, open: 0, inProgress: 0, resolved: 0 },
      requests: [],
    };
  }

  const rows = await prisma.complaintTicket.findMany({
    where: maintenanceWhere(student.id),
    orderBy: { updatedAt: 'desc' },
    take: 50,
    select: {
      id: true,
      ticketNumber: true,
      title: true,
      description: true,
      category: true,
      location: true,
      suggestedPriority: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const requests = rows.map(mapStudentComplaintTicketRow);
  const open = requests.filter((t) => t.status === 'open').length;
  const inProgress = requests.filter((t) => t.status === 'in_progress').length;
  const resolved = requests.filter((t) => t.status === 'resolved').length;

  return {
    generatedAt: now.toISOString(),
    profileLinked: base.profileLinked,
    canSubmit: base.canSubmit,
    hostelName: base.hostelName,
    defaultLocation: base.defaultLocation,
    categories: STUDENT_MAINTENANCE_CATEGORIES,
    priorities: STUDENT_COMPLAINT_PRIORITIES,
    summary: { total: requests.length, open, inProgress, resolved },
    requests,
  };
}

export async function createStudentMaintenanceRequest(
  prisma: PrismaClient,
  userId: string,
  body: CreateStudentMaintenanceBody,
): Promise<StudentMaintenanceDesk> {
  await ensureStudentProfileForUser(prisma, userId);
  await createStudentComplaintTicket(prisma, userId, body);
  return getStudentMaintenanceDesk(prisma, userId);
}