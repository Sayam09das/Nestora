import type { PrismaClient } from '@nestora/database';
import type { CreateStudentComplaintBody } from '@nestora/validators';
import { BadRequestError } from '../../common/errors/index.js';
import { ensureStudentProfileForUser } from '../students/student-profile-ensure.service.js';
import { notifyComplaintSubmitted } from '../notifications/notification-events.service.js';

const TERMINAL_COMPLAINT_STATUSES = ['RESOLVED', 'CLOSED', 'REJECTED'] as const;
const IN_PROGRESS_COMPLAINT_STATUSES = ['IN_PROGRESS', 'ASSIGNED', 'WORKING', 'IN_REVIEW'] as const;

export const STUDENT_COMPLAINT_CATEGORIES = [
  'Maintenance',
  'Electrical',
  'Plumbing',
  'Cleaning',
  'Roommate',
  'Internet',
  'Other',
] as const;

export const STUDENT_COMPLAINT_PRIORITIES = ['Low', 'Medium', 'High'] as const;

export type StudentComplaintTicket = {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  location: string;
  suggestedPriority: string;
  status: 'in_progress' | 'resolved' | 'open';
  statusLabel: string;
  statusNote: string;
  submittedAt: string;
  updatedAt: string;
};

export type StudentComplaintsDesk = {
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
  tickets: StudentComplaintTicket[];
};

function mapComplaintUi(status: string): {
  status: 'in_progress' | 'resolved' | 'open';
  statusLabel: string;
} {
  const upper = status.toUpperCase();
  if (TERMINAL_COMPLAINT_STATUSES.includes(upper as (typeof TERMINAL_COMPLAINT_STATUSES)[number])) {
    return upper === 'REJECTED'
      ? { status: 'resolved', statusLabel: 'Closed' }
      : { status: 'resolved', statusLabel: 'Resolved' };
  }
  if (IN_PROGRESS_COMPLAINT_STATUSES.includes(upper as (typeof IN_PROGRESS_COMPLAINT_STATUSES)[number])) {
    return { status: 'in_progress', statusLabel: 'In Progress' };
  }
  if (['UNDER_REVIEW', 'SUBMITTED', 'OPEN', 'PENDING'].includes(upper)) {
    return { status: 'open', statusLabel: upper === 'UNDER_REVIEW' ? 'Under Review' : 'Submitted' };
  }
  return { status: 'open', statusLabel: 'Open' };
}

function complaintStatusNote(ui: ReturnType<typeof mapComplaintUi>): string {
  if (ui.status === 'resolved') {
    return ui.statusLabel === 'Closed'
      ? 'This request was closed by staff.'
      : 'Marked resolved. Contact the warden if the issue persists.';
  }
  if (ui.status === 'in_progress') {
    return 'Staff are working on this ticket.';
  }
  return 'Waiting for warden or maintenance review.';
}

function formatDisplayDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

async function nextTicketNumber(prisma: PrismaClient): Promise<string> {
  const year = new Date().getUTCFullYear();
  const prefix = `CMP-${year}-`;
  const last = await prisma.complaintTicket.findFirst({
    where: { ticketNumber: { startsWith: prefix } },
    orderBy: { ticketNumber: 'desc' },
    select: { ticketNumber: true },
  });
  const seq = last ? Number.parseInt(last.ticketNumber.slice(prefix.length), 10) + 1 : 1;
  return `${prefix}${String(seq).padStart(4, '0')}`;
}

const emptyDesk = (now: Date): StudentComplaintsDesk => ({
  generatedAt: now.toISOString(),
  profileLinked: false,
  canSubmit: false,
  hostelName: null,
  defaultLocation: null,
  categories: STUDENT_COMPLAINT_CATEGORIES,
  priorities: STUDENT_COMPLAINT_PRIORITIES,
  summary: { total: 0, open: 0, inProgress: 0, resolved: 0 },
  tickets: [],
});

export function mapStudentComplaintTicketRow(row: {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  location: string;
  suggestedPriority: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): StudentComplaintTicket {
  const mapped = mapComplaintUi(row.status);
  return {
    id: row.id,
    ticketNumber: row.ticketNumber,
    title: row.title,
    description: row.description,
    category: row.category,
    location: row.location,
    suggestedPriority: row.suggestedPriority,
    status: mapped.status,
    statusLabel: mapped.statusLabel,
    statusNote: complaintStatusNote(mapped),
    submittedAt: formatDisplayDate(row.createdAt),
    updatedAt: formatDisplayDate(row.updatedAt),
  };
}

export async function getStudentComplaintsDesk(
  prisma: PrismaClient,
  userId: string,
): Promise<StudentComplaintsDesk> {
  const now = new Date();
  await ensureStudentProfileForUser(prisma, userId);

  const student = await prisma.student.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!student) {
    return emptyDesk(now);
  }

  const allocation = await prisma.allocationRecord.findFirst({
    where: { studentId: student.id, status: 'ACTIVE' },
    orderBy: { allocatedAt: 'desc' },
    include: {
      bed: {
        include: {
          room: {
            include: {
              floor: {
                include: {
                  block: { include: { building: { include: { hostel: true } } } },
                },
              },
            },
          },
        },
      },
    },
  });

  const hostel = allocation?.bed.room.floor.block.building.hostel;
  const hostelName = hostel?.name ?? null;
  const hostelId = hostel?.id ?? null;
  const defaultLocation =
    allocation?.bed.room != null
      ? `Room ${allocation.bed.room.roomNumber} · Bed ${allocation.bed.bedNumber.padStart(2, '0')}`
      : null;

  const rows = await prisma.complaintTicket.findMany({
    where: { studentId: student.id },
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

  const tickets = rows.map(mapStudentComplaintTicketRow);
  const open = tickets.filter((t) => t.status === 'open').length;
  const inProgress = tickets.filter((t) => t.status === 'in_progress').length;
  const resolved = tickets.filter((t) => t.status === 'resolved').length;

  return {
    generatedAt: now.toISOString(),
    profileLinked: true,
    canSubmit: Boolean(hostelId),
    hostelName,
    defaultLocation,
    categories: STUDENT_COMPLAINT_CATEGORIES,
    priorities: STUDENT_COMPLAINT_PRIORITIES,
    summary: {
      total: tickets.length,
      open,
      inProgress,
      resolved,
    },
    tickets,
  };
}

export async function createStudentComplaintTicket(
  prisma: PrismaClient,
  userId: string,
  body: CreateStudentComplaintBody,
): Promise<StudentComplaintsDesk> {
  await ensureStudentProfileForUser(prisma, userId);

  const student = await prisma.student.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!student) {
    throw new BadRequestError('Student profile is not linked to this account.');
  }

  const allocation = await prisma.allocationRecord.findFirst({
    where: { studentId: student.id, status: 'ACTIVE' },
    orderBy: { allocatedAt: 'desc' },
    include: {
      bed: {
        include: {
          room: {
            include: {
              floor: {
                include: {
                  block: { include: { building: { include: { hostel: true } } } },
                },
              },
            },
          },
        },
      },
    },
  });

  const hostelId = allocation?.bed.room.floor.block.building.hostel.id;
  if (!hostelId) {
    throw new BadRequestError('You need an active hostel allocation before submitting a complaint.');
  }

  const ticketNumber = await nextTicketNumber(prisma);

  const created = await prisma.complaintTicket.create({
    data: {
      ticketNumber,
      hostelId,
      studentId: student.id,
      category: body.category,
      title: body.title,
      description: body.description,
      location: body.location,
      suggestedPriority: body.suggestedPriority,
      status: 'SUBMITTED',
    },
    select: { id: true, ticketNumber: true },
  });

  await prisma.ticketStatusHistory.create({
    data: {
      ticketId: created.id,
      status: 'SUBMITTED',
      changedBy: userId,
      notes: 'Submitted by student.',
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true },
  });
  const studentName =
    `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'A student';
  await notifyComplaintSubmitted(prisma, {
    hostelId,
    ticketNumber: created.ticketNumber,
    title: body.title,
    studentName,
  });

  return getStudentComplaintsDesk(prisma, userId);
}