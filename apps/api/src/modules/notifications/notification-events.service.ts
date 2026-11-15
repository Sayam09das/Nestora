import type { PrismaClient } from '@nestora/database';
import { createNotifications } from './notification.service.js';
import { scheduleNotificationEmails } from './notification-email.service.js';

async function resolveHostelOperatorUserIds(prisma: PrismaClient, hostelId: string): Promise<string[]> {
  const hostel = await prisma.hostel.findUnique({
    where: { id: hostelId },
    select: { wardenInCharge: true },
  });

  const assignments = await prisma.hostelAssignment.findMany({
    where: {
      hostelId,
      user: {
        status: 'ACTIVE',
        role: { in: ['HOSTEL_WARDEN', 'UNIVERSITY_ADMINISTRATOR'] },
      },
    },
    select: { userId: true },
  });

  const ids = new Set<string>();
  if (hostel?.wardenInCharge) ids.add(hostel.wardenInCharge);
  for (const row of assignments) ids.add(row.userId);
  return [...ids];
}

async function studentUserIdForStudent(prisma: PrismaClient, studentId: string): Promise<string | null> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { userId: true },
  });
  return student?.userId ?? null;
}

export async function notifyLeaveApplicationSubmitted(
  prisma: PrismaClient,
  params: { leaveId: string; hostelId: string; studentName: string; leaveType: string },
): Promise<void> {
  const operatorIds = await resolveHostelOperatorUserIds(prisma, params.hostelId);
  if (operatorIds.length === 0) return;

  const inputs = operatorIds.map((userId) => ({
    userId,
    title: 'New leave request',
    message: `${params.studentName} submitted a ${params.leaveType} leave request.`,
    category: 'leave',
    actionLink: `/warden/leave`,
  }));

  const created = await createNotifications(prisma, inputs);
  scheduleNotificationEmails(prisma, created, 'leave');
}

export async function notifyLeaveDecision(
  prisma: PrismaClient,
  params: {
    studentId: string;
    decision: 'Approved' | 'Rejected';
    leaveId: string;
    hostelName: string;
    passToken?: string | null;
  },
): Promise<void> {
  const userId = await studentUserIdForStudent(prisma, params.studentId);
  if (!userId) return;

  const approved = params.decision === 'Approved';
  const passNote = approved && params.passToken ? ` Gate pass: ${params.passToken}.` : '';
  const inputs = [
    {
      userId,
      title: approved ? 'Leave approved' : 'Leave not approved',
      message: `Your leave for ${params.hostelName} was ${approved ? 'approved' : 'rejected'}.${passNote}`,
      category: 'leave',
      actionLink: approved ? '/student/gate-passes' : '/student/leave',
    },
  ];

  const created = await createNotifications(prisma, inputs);
  scheduleNotificationEmails(prisma, created, 'leave');
}

export async function notifyComplaintSubmitted(
  prisma: PrismaClient,
  params: {
    hostelId: string;
    ticketNumber: string;
    title: string;
    studentName: string;
  },
): Promise<void> {
  const operatorIds = await resolveHostelOperatorUserIds(prisma, params.hostelId);
  if (operatorIds.length === 0) return;

  const inputs = operatorIds.map((userId) => ({
    userId,
    title: 'New complaint ticket',
    message: `${params.studentName} — ${params.ticketNumber}: ${params.title}`,
    category: 'complaint',
    actionLink: '/warden/complaints',
  }));

  const created = await createNotifications(prisma, inputs);
  scheduleNotificationEmails(prisma, created, 'complaint');
}

export async function notifyIncidentReported(
  prisma: PrismaClient,
  params: {
    hostelId: string;
    incidentId: string;
    title: string;
    severity: string;
    reporterName: string;
  },
): Promise<void> {
  const operatorIds = await resolveHostelOperatorUserIds(prisma, params.hostelId);
  if (operatorIds.length === 0) return;

  const inputs = operatorIds.map((userId) => ({
    userId,
    title: 'Emergency / incident reported',
    message: `${params.reporterName}: ${params.title} (${params.severity}). Review immediately.`,
    category: 'incident',
    actionLink: `/warden/incidents/${params.incidentId}`,
  }));

  const created = await createNotifications(prisma, inputs);
  scheduleNotificationEmails(prisma, created, 'incident');
}

export async function notifyOutingApplicationSubmitted(
  prisma: PrismaClient,
  params: { outingId: string; hostelId: string; studentName: string; destination: string },
): Promise<void> {
  const operatorIds = await resolveHostelOperatorUserIds(prisma, params.hostelId);
  if (operatorIds.length === 0) return;

  const inputs = operatorIds.map((userId) => ({
    userId,
    title: 'New outing request',
    message: `${params.studentName} requested an outing to ${params.destination}.`,
    category: 'leave',
    actionLink: '/warden/outings',
  }));

  const created = await createNotifications(prisma, inputs);
  scheduleNotificationEmails(prisma, created, 'leave');
}

export async function notifyOutingDecision(
  prisma: PrismaClient,
  params: {
    studentId: string;
    decision: 'Approved' | 'Rejected';
    outingId: string;
    hostelName: string;
    passToken?: string | null;
  },
): Promise<void> {
  const userId = await studentUserIdForStudent(prisma, params.studentId);
  if (!userId) return;

  const approved = params.decision === 'Approved';
  const passNote = approved && params.passToken ? ` Gate pass: ${params.passToken}.` : '';
  const inputs = [
    {
      userId,
      title: approved ? 'Outing approved' : 'Outing not approved',
      message: `Your outing for ${params.hostelName} was ${approved ? 'approved' : 'rejected'}.${passNote}`,
      category: 'leave',
      actionLink: approved ? '/student/gate-passes' : '/student/outings',
    },
  ];

  const created = await createNotifications(prisma, inputs);
  scheduleNotificationEmails(prisma, created, 'leave');
}