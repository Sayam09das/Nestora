import type { PrismaClient, StudentGender, UserStatus } from '@nestora/database';
import type { UpdateStudentSelfProfileBody } from '@nestora/validators';
import { BadRequestError, NotFoundError } from '../../common/errors/index.js';
import type { Env } from '../../config/index.js';
import * as authService from '../auth/auth.service.js';
import { ensureStudentProfileForUser } from '../students/student-profile-ensure.service.js';
import { isSafeObjectKey } from '../storage/object-key.js';
import { assertObjectExists, buildPublicProfilePhotoUrl } from '../storage/storage.service.js';

export type StudentSelfProfileDesk = {
  generatedAt: string;
  profileLinked: boolean;
  account: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    status: UserStatus;
    isVerified: boolean;
    mfaEnabled: boolean;
    profilePhotoUrl: string | null;
    lastLoginAt: string | null;
  };
  academic: {
    registrationNumber: string;
    department: string;
    course: string;
    currentSemester: string;
    academicYear: string;
    admissionYear: string;
    status: string;
  };
  personal: {
    gender: string;
    dateOfBirth: string;
    bloodGroup: string | null;
    permanentAddress: string;
    identityVerified: boolean;
  };
  guardian: {
    name: string;
    relationship: string;
    primaryPhone: string;
    alternatePhone: string | null;
    address: string;
  };
  hostel: {
    allocated: boolean;
    hostelName: string | null;
    block: string | null;
    roomNumber: string | null;
    bedNumber: string | null;
    roomType: string | null;
    allocationDate: string | null;
  };
  documents: Array<{
    id: string;
    name: string;
    status: 'verified' | 'pending';
    uploadedAt: string;
  }>;
  security: {
    activeSessions: number;
  };
};

function mapGender(gender: StudentGender): string {
  if (gender === 'FEMALE') return 'Female';
  if (gender === 'MALE') return 'Male';
  return 'Other';
}

function formatDob(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function formatAllocationDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function mapAccountStatus(status: UserStatus): string {
  if (status === 'ACTIVE') return 'Active';
  if (status === 'INACTIVE') return 'Inactive';
  return status.replace(/_/g, ' ');
}

function mapAcademicStatus(linked: boolean, status: UserStatus): string {
  if (!linked) return 'Profile pending';
  if (status !== 'ACTIVE') return 'Account inactive';
  return 'Enrolled';
}

export async function getStudentSelfProfileDesk(
  prisma: PrismaClient,
  env: Env,
  userId: string,
): Promise<StudentSelfProfileDesk> {
  const now = new Date();
  await ensureStudentProfileForUser(prisma, userId);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      student: {
        include: {
          documents: { orderBy: { uploadedAt: 'desc' } },
          allocationRecords: {
            where: { status: 'ACTIVE' },
            take: 1,
            orderBy: { allocatedAt: 'desc' },
            include: {
              bed: {
                include: {
                  room: {
                    include: {
                      config: true,
                      floor: { include: { block: { include: { building: { include: { hostel: true } } } } } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user || user.role !== 'STUDENT') {
    throw new NotFoundError('Student account not found.');
  }

  const student = user.student;
  const profileLinked = Boolean(student);
  const sessions = await authService.listSessionsForUser(prisma, userId);
  const lastLoginAt = sessions.reduce<Date | null>((latest, session) => {
    const at = session.lastActivityAt ?? session.createdAt;
    if (!latest || at > latest) return at;
    return latest;
  }, null);

  const allocation = student?.allocationRecords[0];
  const room = allocation?.bed.room;
  const hostel = room?.floor.block.building.hostel;

  const hostelBlock =
    profileLinked && allocation && room && hostel
      ? {
          allocated: true,
          hostelName: hostel.name,
          block: room.floor.block.name,
          roomNumber: room.roomNumber,
          bedNumber: `Bed ${allocation.bed.bedNumber.padStart(2, '0')}`,
          roomType: room.config.description || `${room.config.capacity}-sharing`,
          allocationDate: formatAllocationDate(allocation.startDate),
        }
      : {
          allocated: false,
          hostelName: null,
          block: null,
          roomNumber: null,
          bedNumber: null,
          roomType: null,
          allocationDate: null,
        };

  const documents =
    student?.documents.map((doc) => ({
      id: doc.id,
      name: doc.fileName,
      status: 'verified' as const,
      uploadedAt: doc.uploadedAt.toISOString(),
    })) ?? [];

  if (profileLinked && documents.length === 0) {
    documents.push({
      id: 'admission-pending',
      name: 'Admission documents',
      status: 'pending',
      uploadedAt: student.createdAt.toISOString(),
    });
  }

  return {
    generatedAt: now.toISOString(),
    profileLinked,
    account: {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phoneNumber,
      status: user.status,
      isVerified: user.isVerified,
      mfaEnabled: user.mfaEnabled,
      profilePhotoUrl: user.profilePhotoKey
        ? buildPublicProfilePhotoUrl(env, user.profilePhotoKey)
        : null,
      lastLoginAt: lastLoginAt?.toISOString() ?? null,
    },
    academic: {
      registrationNumber: student?.registrationNumber ?? '—',
      department: student?.department ?? '—',
      course: student?.course ?? '—',
      currentSemester: student?.currentSemester ?? '—',
      academicYear: student?.academicYear ?? '—',
      admissionYear: student ? String(student.createdAt.getUTCFullYear()) : '—',
      status: mapAcademicStatus(profileLinked, user.status),
    },
    personal: {
      gender: student ? mapGender(student.gender) : '—',
      dateOfBirth: student ? formatDob(student.dateOfBirth) : '—',
      bloodGroup: student?.bloodGroup ?? '—',
      permanentAddress: student?.permanentAddress ?? '—',
      identityVerified: user.isVerified,
    },
    guardian: {
      name: student?.guardianName ?? '—',
      relationship: student?.guardianRelation ?? '—',
      primaryPhone: student?.guardianPhone ?? '—',
      alternatePhone: null,
      address: student?.permanentAddress ?? '—',
    },
    hostel: hostelBlock,
    documents,
    security: {
      activeSessions: sessions.length,
    },
  };
}

export async function updateStudentSelfProfileDesk(
  prisma: PrismaClient,
  env: Env,
  userId: string,
  body: UpdateStudentSelfProfileBody,
): Promise<StudentSelfProfileDesk> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { student: true },
  });
  if (!user || user.role !== 'STUDENT') {
    throw new NotFoundError('Student account not found.');
  }
  if (!user.student) {
    throw new BadRequestError('Complete student registration before editing your profile.');
  }

  const userPatch: { phoneNumber?: string | null; profilePhotoKey?: string | null } = {};
  if (body.phone !== undefined) {
    userPatch.phoneNumber = body.phone.trim() || null;
  }
  if (body.profilePhotoObjectKey !== undefined) {
    const key = body.profilePhotoObjectKey.trim();
    if (key) {
      if (!isSafeObjectKey(key)) {
        throw new BadRequestError('Invalid profile photo reference.');
      }
      await assertObjectExists(env, 'public', key);
      userPatch.profilePhotoKey = key;
    } else {
      userPatch.profilePhotoKey = null;
    }
  }

  const studentPatch: {
    permanentAddress?: string;
    guardianName?: string;
    guardianPhone?: string;
    guardianRelation?: string;
  } = {};
  if (body.permanentAddress !== undefined) {
    studentPatch.permanentAddress = body.permanentAddress.trim() || user.student.permanentAddress;
  }
  if (body.guardianName !== undefined) {
    studentPatch.guardianName = body.guardianName.trim() || user.student.guardianName;
  }
  if (body.guardianPhone !== undefined) {
    studentPatch.guardianPhone = body.guardianPhone.trim() || user.student.guardianPhone;
  }
  if (body.guardianRelation !== undefined) {
    studentPatch.guardianRelation = body.guardianRelation.trim() || user.student.guardianRelation;
  }

  await prisma.$transaction(async (tx) => {
    if (Object.keys(userPatch).length > 0) {
      await tx.user.update({ where: { id: userId }, data: userPatch });
    }
    if (Object.keys(studentPatch).length > 0) {
      await tx.student.update({ where: { id: user.student!.id }, data: studentPatch });
    }
  });

  return getStudentSelfProfileDesk(prisma, env, userId);
}