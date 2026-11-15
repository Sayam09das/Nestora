import type { PrismaClient } from '@nestora/database';
import type { CreateStudentHelpRequestBody } from '@nestora/validators';
import { BadRequestError } from '../../common/errors/index.js';
import {
  createStudentComplaintTicket,
  getStudentComplaintsDesk,
  type StudentComplaintTicket,
} from './student-complaints.service.js';
import { ensureStudentProfileForUser } from '../students/student-profile-ensure.service.js';

export type StudentHelpArticle = {
  id: string;
  category: string;
  question: string;
  answer: string;
};

export type StudentHelpContact = {
  id: string;
  role: string;
  name: string;
  phone: string | null;
  email: string | null;
  telHref: string | null;
};

export type StudentHelpQuickLink = {
  id: string;
  label: string;
  description: string;
  href: string;
};

export type StudentHelpDesk = {
  generatedAt: string;
  profileLinked: boolean;
  hostelName: string | null;
  canSubmit: boolean;
  summary: {
    openRequests: number;
    inProgress: number;
    resolved: number;
  };
  faq: StudentHelpArticle[];
  contacts: StudentHelpContact[];
  quickLinks: StudentHelpQuickLink[];
  supportRequests: StudentComplaintTicket[];
};

const STUDENT_FAQ: StudentHelpArticle[] = [
  {
    id: 'leave-gate',
    category: 'Leave & gate',
    question: 'How do I apply for leave?',
    answer:
      'Open Leave Requests, submit departure and return dates with emergency contact. Approved leave generates gate pass rules shown at the exit.',
  },
  {
    id: 'visitors',
    category: 'Visitors',
    question: 'How do I register a visitor?',
    answer:
      'Use Visitor Requests to pre-register guests. Security approves before check-in; keep ID details ready at the gate.',
  },
  {
    id: 'maintenance',
    category: 'Repairs',
    question: 'Maintenance vs general complaints?',
    answer:
      'Maintenance is for electrical, plumbing, cleaning, and internet issues. Use Complaints for conduct, roommate, or other hostel matters.',
  },
  {
    id: 'fees',
    category: 'Fees',
    question: 'Where do I see my fee balance?',
    answer:
      'Fee & Payments shows assessed amount, receipts, and outstanding balance. Pay at the accounts office unless online payment is enabled.',
  },
  {
    id: 'emergency',
    category: 'Safety',
    question: 'What counts as an emergency?',
    answer:
      'Medical, security, or fire risks use Emergency Contacts. Call 112 for immediate danger, then report in the hostel emergency form.',
  },
  {
    id: 'profile',
    category: 'Account',
    question: 'How do I update guardian or phone?',
    answer:
      'Edit My Profile for guardian and personal details. Notification and security preferences are under Settings.',
  },
];

const QUICK_LINKS: StudentHelpQuickLink[] = [
  { id: 'complaints', label: 'Complaints', description: 'Track maintenance and conduct tickets.', href: '/student/complaints' },
  { id: 'emergency', label: 'Emergency', description: 'Hotlines and incident reporting.', href: '/student/emergency' },
  { id: 'rules', label: 'Rules', description: 'Hostel policies and circulars.', href: '/student/rules' },
  { id: 'profile', label: 'My profile', description: 'Guardian, documents, and room info.', href: '/student/profile' },
];

function telHref(phone: string | null | undefined): string | null {
  if (!phone?.trim()) return null;
  const digits = phone.replace(/[^\d+]/g, '');
  return digits.length >= 6 ? `tel:${digits}` : null;
}

const emptyDesk = (now: Date): StudentHelpDesk => ({
  generatedAt: now.toISOString(),
  profileLinked: false,
  hostelName: null,
  canSubmit: false,
  summary: { openRequests: 0, inProgress: 0, resolved: 0 },
  faq: STUDENT_FAQ,
  contacts: [],
  quickLinks: QUICK_LINKS,
  supportRequests: [],
});

export async function getStudentHelpDesk(prisma: PrismaClient, userId: string): Promise<StudentHelpDesk> {
  const now = new Date();
  await ensureStudentProfileForUser(prisma, userId);

  const student = await prisma.student.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!student) {
    return emptyDesk(now);
  }

  const [complaintsDesk, allocation] = await Promise.all([
    getStudentComplaintsDesk(prisma, userId),
    prisma.allocationRecord.findFirst({
      where: { studentId: student.id, status: 'ACTIVE' },
      orderBy: { allocatedAt: 'desc' },
      include: {
        bed: {
          include: {
            room: {
              include: {
                floor: {
                  include: {
                    block: {
                      include: {
                        building: {
                          include: {
                            hostel: {
                              include: {
                                warden: {
                                  select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    phoneNumber: true,
                                    email: true,
                                  },
                                },
                                university: { select: { name: true, contactEmail: true } },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  const hostel = allocation?.bed.room.floor.block.building.hostel;
  const contacts: StudentHelpContact[] = [];

  if (hostel?.warden) {
    const w = hostel.warden;
    contacts.push({
      id: `warden-${w.id}`,
      role: 'Duty warden',
      name: `${w.firstName} ${w.lastName}`.trim(),
      phone: w.phoneNumber,
      email: w.email,
      telHref: telHref(w.phoneNumber),
    });
  }

  if (hostel?.university.contactEmail) {
    contacts.push({
      id: 'university',
      role: 'University help desk',
      name: hostel.university.name,
      phone: null,
      email: hostel.university.contactEmail,
      telHref: null,
    });
  }

  const supportRequests = complaintsDesk.tickets.slice(0, 12);

  return {
    generatedAt: now.toISOString(),
    profileLinked: true,
    hostelName: complaintsDesk.hostelName,
    canSubmit: complaintsDesk.canSubmit,
    summary: {
      openRequests: complaintsDesk.summary.open,
      inProgress: complaintsDesk.summary.inProgress,
      resolved: complaintsDesk.summary.resolved,
    },
    faq: STUDENT_FAQ,
    contacts,
    quickLinks: QUICK_LINKS,
    supportRequests,
  };
}

export async function submitStudentHelpRequest(
  prisma: PrismaClient,
  userId: string,
  body: CreateStudentHelpRequestBody,
): Promise<StudentHelpDesk> {
  const allocationLocation = await prisma.allocationRecord.findFirst({
    where: { student: { userId }, status: 'ACTIVE' },
    orderBy: { allocatedAt: 'desc' },
    include: {
      bed: { include: { room: true } },
    },
  });

  const location =
    allocationLocation?.bed.room != null
      ? `Room ${allocationLocation.bed.room.roomNumber} · Help desk`
      : 'Student portal';

  await createStudentComplaintTicket(prisma, userId, {
    category: 'Other',
    title: body.title,
    description: body.description,
    location,
    suggestedPriority: 'Medium',
  });

  return getStudentHelpDesk(prisma, userId);
}