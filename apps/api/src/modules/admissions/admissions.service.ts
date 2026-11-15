import type { PrismaClient, StudentGender } from '@nestora/database';
import type { AdmissionTierVerificationBody } from '@nestora/validators';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../common/errors/index.js';
import { hostelNameInScope } from '../../common/helpers/warden-hostel-scope.js';
import { logAuditEventInTransaction } from '../audit/audit.service.js';
import {
  ADMISSION_STATUS,
  VERIFICATION_DECISION,
  VERIFICATION_TIER,
} from './admissions.constants.js';

export type AdmissionVerificationRow = {
  id: string;
  tier: string;
  tierLabel: string;
  decision: string;
  comments: string | null;
  verifiedAt: string;
  actorName: string;
};

export type StudentAdmissionProfile = {
  applicationId: string | null;
  status: string | null;
  statusLabel: string;
  hostelId: string | null;
  hostelName: string | null;
  academicSession: string | null;
  tier2Pending: boolean;
  tier1Complete: boolean;
  fullyApproved: boolean;
  rejected: boolean;
  verificationHistory: AdmissionVerificationRow[];
};

const TIER_LABEL: Record<string, string> = {
  TIER_1_ADMIN: 'Tier-1 (Admin)',
  TIER_2_WARDEN: 'Tier-2 (Warden)',
};

function statusLabel(status: string | null): string {
  switch (status) {
    case ADMISSION_STATUS.SUBMITTED:
      return 'Submitted';
    case ADMISSION_STATUS.ADMIN_VERIFIED:
      return 'Awaiting warden verification';
    case ADMISSION_STATUS.FULLY_APPROVED:
      return 'Fully approved';
    case ADMISSION_STATUS.REJECTED:
      return 'Rejected';
    default:
      return status ?? 'No application';
  }
}

function mapGenderToHostelCategory(gender: StudentGender): 'BOYS_HOSTEL' | 'GIRLS_HOSTEL' {
  return gender === 'FEMALE' ? 'GIRLS_HOSTEL' : 'BOYS_HOSTEL';
}

export async function resolveHostelForNewApplication(
  prisma: PrismaClient,
  studentGender: StudentGender,
  preferredHostelId?: string,
): Promise<{ id: string; name: string }> {
  if (preferredHostelId) {
    const hostel = await prisma.hostel.findUnique({
      where: { id: preferredHostelId },
      select: { id: true, name: true, genderCategory: true },
    });
    if (hostel) return { id: hostel.id, name: hostel.name };
  }

  const category = mapGenderToHostelCategory(studentGender);
  const hostel = await prisma.hostel.findFirst({
    where: { genderCategory: category },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });
  if (!hostel) {
    throw new BadRequestError('No hostel configured for this student category.');
  }
  return hostel;
}

export async function createAdmissionWithTier1Approval(
  prisma: PrismaClient,
  studentId: string,
  academicSession: string,
  studentGender: StudentGender,
  adminUserId: string,
): Promise<void> {
  const pref = await prisma.bedPreference.findFirst({
    where: { studentId },
    orderBy: { submittedAt: 'desc' },
    select: { hostelId: true },
  });
  const hostel = await resolveHostelForNewApplication(prisma, studentGender, pref?.hostelId);

  await prisma.$transaction(async (tx) => {
    const app = await tx.admissionApplication.create({
      data: {
        studentId,
        hostelId: hostel.id,
        academicSession,
        status: ADMISSION_STATUS.SUBMITTED,
      },
    });
    await tx.admissionVerification.create({
      data: {
        applicationId: app.id,
        verifiedBy: adminUserId,
        tier: VERIFICATION_TIER.TIER_1_ADMIN,
        decision: VERIFICATION_DECISION.APPROVED,
        comments: 'Auto-recorded on admin registration (tier-1).',
      },
    });
    await tx.admissionApplication.update({
      where: { id: app.id },
      data: { status: ADMISSION_STATUS.ADMIN_VERIFIED },
    });
  });
}

export async function ensureAdmissionApplication(
  prisma: PrismaClient,
  studentId: string,
  academicSession: string,
  studentGender: StudentGender,
  opts?: { promoteToAdminVerified?: boolean },
): Promise<{ id: string; status: string; hostelId: string }> {
  const existing = await prisma.admissionApplication.findFirst({
    where: { studentId, academicSession },
    orderBy: { submittedAt: 'desc' },
    select: { id: true, status: true, hostelId: true },
  });
  if (existing) return existing;

  const pref = await prisma.bedPreference.findFirst({
    where: { studentId },
    orderBy: { submittedAt: 'desc' },
    select: { hostelId: true },
  });

  const hostel = await resolveHostelForNewApplication(prisma, studentGender, pref?.hostelId);
  const initialStatus = opts?.promoteToAdminVerified
    ? ADMISSION_STATUS.ADMIN_VERIFIED
    : ADMISSION_STATUS.SUBMITTED;

  const created = await prisma.admissionApplication.create({
    data: {
      studentId,
      hostelId: hostel.id,
      academicSession,
      status: initialStatus,
    },
    select: { id: true, status: true, hostelId: true },
  });

  return created;
}

export async function getStudentAdmissionProfile(
  prisma: PrismaClient,
  studentUserId: string,
): Promise<StudentAdmissionProfile | null> {
  const student = await prisma.student.findUnique({
    where: { userId: studentUserId },
    select: {
      id: true,
      academicYear: true,
      gender: true,
      user: { select: { status: true, isVerified: true } },
    },
  });
  if (!student) return null;

  let application = await prisma.admissionApplication.findFirst({
    where: { studentId: student.id },
    orderBy: { submittedAt: 'desc' },
    include: {
      hostel: { select: { id: true, name: true } },
      verifications: { orderBy: { verifiedAt: 'asc' } },
    },
  });

  if (!application) {
    const promote =
      student.user.status === 'ACTIVE' && student.user.isVerified;
    const ensured = await ensureAdmissionApplication(
      prisma,
      student.id,
      student.academicYear,
      student.gender,
      { promoteToAdminVerified: promote },
    );
    application = await prisma.admissionApplication.findUniqueOrThrow({
      where: { id: ensured.id },
      include: {
        hostel: { select: { id: true, name: true } },
        verifications: { orderBy: { verifiedAt: 'asc' } },
      },
    });
  }

  const verifierIds = [...new Set(application.verifications.map((v) => v.verifiedBy))];
  const verifiers =
    verifierIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: verifierIds } },
          select: { id: true, firstName: true, lastName: true, role: true },
        })
      : [];
  const verifierName = new Map(
    verifiers.map((u) => [u.id, `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.role]),
  );

  const verificationHistory: AdmissionVerificationRow[] = application.verifications.map((row) => ({
    id: row.id,
    tier: row.tier,
    tierLabel: TIER_LABEL[row.tier] ?? row.tier,
    decision: row.decision,
    comments: row.comments,
    verifiedAt: row.verifiedAt.toISOString(),
    actorName: verifierName.get(row.verifiedBy) ?? 'Reviewer',
  }));

  const status = application.status;
  const tier2Pending = status === ADMISSION_STATUS.ADMIN_VERIFIED;
  const tier1Complete =
    status === ADMISSION_STATUS.ADMIN_VERIFIED ||
    status === ADMISSION_STATUS.FULLY_APPROVED ||
    application.verifications.some((v) => v.tier === VERIFICATION_TIER.TIER_1_ADMIN);

  return {
    applicationId: application.id,
    status,
    statusLabel: statusLabel(status),
    hostelId: application.hostel.id,
    hostelName: application.hostel.name,
    academicSession: application.academicSession,
    tier2Pending,
    tier1Complete,
    fullyApproved: status === ADMISSION_STATUS.FULLY_APPROVED,
    rejected: status === ADMISSION_STATUS.REJECTED,
    verificationHistory,
  };
}

async function loadApplicationInScope(
  prisma: PrismaClient,
  applicationId: string,
  scopeHostelNames?: string[],
) {
  const application = await prisma.admissionApplication.findUnique({
    where: { id: applicationId },
    include: {
      hostel: { select: { id: true, name: true } },
      student: { select: { id: true, userId: true, registrationNumber: true } },
    },
  });
  if (!application) {
    throw new NotFoundError('Admission application not found.');
  }
  if (scopeHostelNames && scopeHostelNames.length > 0) {
    if (!hostelNameInScope(application.hostel.name, scopeHostelNames)) {
      throw new ForbiddenError('This application is outside your assigned hostel scope.');
    }
  }
  return application;
}

export async function verifyAdmissionTier1(
  prisma: PrismaClient,
  actorUserId: string,
  actorRole: string,
  applicationId: string,
  body: AdmissionTierVerificationBody,
  ip?: string,
): Promise<StudentAdmissionProfile> {
  const application = await loadApplicationInScope(prisma, applicationId);

  if (application.status !== ADMISSION_STATUS.SUBMITTED) {
    throw new BadRequestError('Tier-1 verification applies only to submitted applications.');
  }

  const nextStatus =
    body.decision === VERIFICATION_DECISION.APPROVED
      ? ADMISSION_STATUS.ADMIN_VERIFIED
      : ADMISSION_STATUS.REJECTED;

  await prisma.$transaction(async (tx) => {
    await tx.admissionVerification.create({
      data: {
        applicationId: application.id,
        verifiedBy: actorUserId,
        tier: VERIFICATION_TIER.TIER_1_ADMIN,
        decision: body.decision,
        comments: body.comments?.trim() || null,
      },
    });
    await tx.admissionApplication.update({
      where: { id: application.id },
      data: {
        status: nextStatus,
        rejectionReason:
          body.decision === VERIFICATION_DECISION.REJECTED ? body.comments?.trim() ?? null : null,
      },
    });
    await logAuditEventInTransaction(tx, {
      actorUserId,
      actorRole,
      actionName: body.decision === VERIFICATION_DECISION.APPROVED ? 'ADMISSION_TIER1_APPROVE' : 'ADMISSION_TIER1_REJECT',
      entityType: 'AdmissionApplication',
      entityId: application.id,
      previousState: { status: application.status },
      newState: { status: nextStatus },
      ipAddress: ip ?? null,
    });
  });

  const profile = await getStudentAdmissionProfile(prisma, application.student.userId);
  if (!profile) throw new NotFoundError('Student not found.');
  return profile;
}

export async function verifyAdmissionTier2(
  prisma: PrismaClient,
  actorUserId: string,
  actorRole: string,
  applicationId: string,
  body: AdmissionTierVerificationBody,
  scopeHostelNames: string[],
  ip?: string,
): Promise<StudentAdmissionProfile> {
  const application = await loadApplicationInScope(prisma, applicationId, scopeHostelNames);

  if (application.status !== ADMISSION_STATUS.ADMIN_VERIFIED) {
    throw new BadRequestError('Tier-2 warden verification requires admin tier-1 approval first.');
  }

  const nextStatus =
    body.decision === VERIFICATION_DECISION.APPROVED
      ? ADMISSION_STATUS.FULLY_APPROVED
      : ADMISSION_STATUS.REJECTED;

  await prisma.$transaction(async (tx) => {
    await tx.admissionVerification.create({
      data: {
        applicationId: application.id,
        verifiedBy: actorUserId,
        tier: VERIFICATION_TIER.TIER_2_WARDEN,
        decision: body.decision,
        comments: body.comments?.trim() || null,
      },
    });
    await tx.admissionApplication.update({
      where: { id: application.id },
      data: {
        status: nextStatus,
        rejectionReason:
          body.decision === VERIFICATION_DECISION.REJECTED ? body.comments?.trim() ?? null : null,
      },
    });
    await logAuditEventInTransaction(tx, {
      actorUserId,
      actorRole,
      actionName:
        body.decision === VERIFICATION_DECISION.APPROVED ? 'ADMISSION_TIER2_APPROVE' : 'ADMISSION_TIER2_REJECT',
      entityType: 'AdmissionApplication',
      entityId: application.id,
      previousState: { status: application.status },
      newState: { status: nextStatus },
      ipAddress: ip ?? null,
    });
  });

  const profile = await getStudentAdmissionProfile(prisma, application.student.userId);
  if (!profile) throw new NotFoundError('Student not found.');
  return profile;
}