import type { Prisma, PrismaClient, StudentGender, UserStatus } from '@nestora/database';
import type { RegisterStudentBody } from '@nestora/validators';
import * as argon2 from 'argon2';
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from '../../common/constants/limits.js';
import {
  BadRequestError,
  InternalError,
  NotFoundError,
} from '../../common/errors/index.js';
import { buildPaginationMeta, normalizePagination } from '../../common/helpers/index.js';
import type { StudentDirectoryListQuery } from '@nestora/validators';
import type { Env } from '../../config/index.js';
import { createOpaqueToken } from '../../lib/crypto-token.js';
import * as auditService from '../audit/audit.service.js';
import * as repo from '../auth/auth.repository.js';
import { argon2ParamsFromEnv } from '../auth/password.service.js';
import * as mailService from '../auth/mail.service.js';
import { isSafeObjectKey } from '../storage/object-key.js';
import { assertObjectExists, buildPublicProfilePhotoUrl } from '../storage/storage.service.js';

export type StudentDirectoryUiStatus = 'Active' | 'Pending' | 'Inactive';

export type StudentDirectorySummary = {
  generatedAt: string;
  total: number;
  active: number;
  pending: number;
  inactive: number;
  activeRatePercent: number | null;
  createdThisMonth: number;
  facets: {
    hostels: string[];
    courses: string[];
    academicYears: string[];
  };
};

export type StudentDirectoryRow = {
  id: string;
  studentId: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  academicYear: string;
  hostel: string;
  room: string;
  status: StudentDirectoryUiStatus;
  joinedDate: string;
  profilePhotoUrl: string | null;
};

function startOfUtcMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function mapDirectoryStatus(status: UserStatus, isVerified: boolean): StudentDirectoryUiStatus {
  if (status === 'ACTIVE') {
    return 'Active';
  }
  if (status === 'SUSPENDED') {
    return 'Inactive';
  }
  if (status === 'INACTIVE' && !isVerified) {
    return 'Pending';
  }
  return 'Inactive';
}

function studentUserWhere(): Prisma.UserWhereInput {
  return { role: 'STUDENT' };
}

function statusWhere(uiStatus: StudentDirectoryUiStatus): Prisma.UserWhereInput {
  switch (uiStatus) {
    case 'Active':
      return { status: 'ACTIVE' };
    case 'Pending':
      return { status: 'INACTIVE', isVerified: false };
    case 'Inactive':
      return {
        OR: [{ status: 'SUSPENDED' }, { status: 'INACTIVE', isVerified: true }],
      };
    default:
      return {};
  }
}

const allocationInclude = {
  where: { status: 'ACTIVE' as const },
  take: 1,
  orderBy: { allocatedAt: 'desc' as const },
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
                      include: { hostel: { select: { name: true } } },
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
};

function studentAllocatedToHostelsWhere(hostelNames: string[]): Prisma.StudentWhereInput {
  if (hostelNames.length === 0) {
    return { id: { equals: '00000000-0000-0000-0000-000000000000' } };
  }
  const hostelNameFilter =
    hostelNames.length === 1
      ? { equals: hostelNames[0], mode: 'insensitive' as const }
      : { in: hostelNames, mode: 'insensitive' as const };

  return {
    allocationRecords: {
      some: {
        status: 'ACTIVE',
        bed: {
          room: {
            floor: {
              block: {
                building: {
                  hostel: {
                    name: hostelNameFilter,
                  },
                },
              },
            },
          },
        },
      },
    },
  };
}

function rowFromUser(
  u: Prisma.UserGetPayload<{
    include: {
      student: {
        include: {
          allocationRecords: typeof allocationInclude;
        };
      };
    };
  }>,
  env: Env,
): StudentDirectoryRow {
  const student = u.student;
  const allocation = student?.allocationRecords[0];
  const hostelName = allocation?.bed.room.floor.block.building.hostel.name;
  const roomNumber = allocation?.bed.room.roomNumber;

  return {
    id: u.id,
    studentId: student?.registrationNumber ?? `STU-${u.id.slice(0, 8).toUpperCase()}`,
    name: `${u.firstName} ${u.lastName}`.trim(),
    email: u.email,
    phone: u.phoneNumber?.trim() || '—',
    course: student?.course ?? '—',
    academicYear: student?.academicYear ?? '—',
    hostel: hostelName ?? 'Not allocated',
    room: roomNumber ?? '—',
    status: mapDirectoryStatus(u.status, u.isVerified),
    joinedDate: u.createdAt.toISOString().slice(0, 10),
    profilePhotoUrl: u.profilePhotoKey ? buildPublicProfilePhotoUrl(env, u.profilePhotoKey) : null,
  };
}

export async function getStudentDirectorySummaryForHostels(
  prisma: PrismaClient,
  scopeHostelNames: string[],
): Promise<StudentDirectorySummary> {
  if (scopeHostelNames.length === 0) {
    return {
      generatedAt: new Date().toISOString(),
      total: 0,
      active: 0,
      pending: 0,
      inactive: 0,
      activeRatePercent: null,
      createdThisMonth: 0,
      facets: {
        hostels: [],
        courses: [],
        academicYears: [],
      },
    };
  }

  const base: Prisma.UserWhereInput = {
    ...studentUserWhere(),
    student: { is: studentAllocatedToHostelsWhere(scopeHostelNames) },
  };
  const monthStart = startOfUtcMonth(new Date());

  const [total, active, pending, inactive, createdThisMonth, courseRows, yearRows] =
    await Promise.all([
      prisma.user.count({ where: base }),
      prisma.user.count({ where: { ...base, status: 'ACTIVE' } }),
      prisma.user.count({ where: { ...base, status: 'INACTIVE', isVerified: false } }),
      prisma.user.count({
        where: {
          ...base,
          OR: [{ status: 'SUSPENDED' }, { status: 'INACTIVE', isVerified: true }],
        },
      }),
      prisma.user.count({ where: { ...base, createdAt: { gte: monthStart } } }),
      prisma.student.findMany({
        where: studentAllocatedToHostelsWhere(scopeHostelNames),
        select: { course: true },
        distinct: ['course'],
        orderBy: { course: 'asc' },
      }),
      prisma.student.findMany({
        where: studentAllocatedToHostelsWhere(scopeHostelNames),
        select: { academicYear: true },
        distinct: ['academicYear'],
        orderBy: { academicYear: 'desc' },
      }),
    ]);

  const activeRatePercent = total > 0 ? Math.round((active / total) * 1000) / 10 : null;

  return {
    generatedAt: new Date().toISOString(),
    total,
    active,
    pending,
    inactive,
    activeRatePercent,
    createdThisMonth,
    facets: {
      hostels: [...scopeHostelNames].sort((a, b) => a.localeCompare(b)),
      courses: courseRows.map((c) => c.course).filter(Boolean),
      academicYears: yearRows.map((y) => y.academicYear).filter(Boolean),
    },
  };
}

export async function getStudentDirectorySummary(
  prisma: PrismaClient,
): Promise<StudentDirectorySummary> {
  const base = studentUserWhere();
  const monthStart = startOfUtcMonth(new Date());

  const [total, active, pending, inactive, createdThisMonth, courseRows, yearRows, hostelRows] =
    await Promise.all([
      prisma.user.count({ where: base }),
      prisma.user.count({ where: { ...base, status: 'ACTIVE' } }),
      prisma.user.count({ where: { ...base, status: 'INACTIVE', isVerified: false } }),
      prisma.user.count({
        where: {
          ...base,
          OR: [{ status: 'SUSPENDED' }, { status: 'INACTIVE', isVerified: true }],
        },
      }),
      prisma.user.count({ where: { ...base, createdAt: { gte: monthStart } } }),
      prisma.student.findMany({ select: { course: true }, distinct: ['course'], orderBy: { course: 'asc' } }),
      prisma.student.findMany({
        select: { academicYear: true },
        distinct: ['academicYear'],
        orderBy: { academicYear: 'desc' },
      }),
      prisma.hostel.findMany({
        where: { isActive: true },
        select: { name: true },
        orderBy: { name: 'asc' },
      }),
    ]);

  const activeRatePercent = total > 0 ? Math.round((active / total) * 1000) / 10 : null;

  return {
    generatedAt: new Date().toISOString(),
    total,
    active,
    pending,
    inactive,
    activeRatePercent,
    createdThisMonth,
    facets: {
      hostels: hostelRows.map((h) => h.name),
      courses: courseRows.map((c) => c.course).filter(Boolean),
      academicYears: yearRows.map((y) => y.academicYear).filter(Boolean),
    },
  };
}

export type StudentDirectoryListOptions = StudentDirectoryListQuery & {
  scopeHostelNames?: string[];
};

export async function listStudentDirectory(
  prisma: PrismaClient,
  env: Env,
  query: StudentDirectoryListOptions,
): Promise<{
  students: StudentDirectoryRow[];
  pagination: ReturnType<typeof buildPaginationMeta>;
}> {
  const page = query.page ?? DEFAULT_PAGE;
  const limit = query.limit ?? DEFAULT_PAGE_LIMIT;
  const { page: safePage, limit: safeLimit, skip } = normalizePagination(page, limit);

  const and: Prisma.UserWhereInput[] = [];

  if (query.q?.trim()) {
    const term = query.q.trim();
    and.push({
      OR: [
        { email: { contains: term, mode: 'insensitive' } },
        { firstName: { contains: term, mode: 'insensitive' } },
        { lastName: { contains: term, mode: 'insensitive' } },
        { phoneNumber: { contains: term, mode: 'insensitive' } },
        {
          student: {
            registrationNumber: { contains: term, mode: 'insensitive' },
          },
        },
      ],
    });
  }

  const studentFilters: Prisma.StudentWhereInput = {};
  if (query.course?.trim() && query.course !== 'All Courses') {
    studentFilters.course = query.course.trim();
  }
  if (query.academicYear?.trim() && query.academicYear !== 'All Years') {
    studentFilters.academicYear = query.academicYear.trim();
  }
  if (query.hostel?.trim() && query.hostel !== 'All Hostels') {
    if (query.hostel.trim() === 'Not allocated') {
      studentFilters.allocationRecords = {
        none: { status: 'ACTIVE' },
      };
    } else {
      studentFilters.allocationRecords = {
        some: {
          status: 'ACTIVE',
          bed: {
            room: {
              floor: {
                block: {
                  building: {
                    hostel: {
                      name: { equals: query.hostel.trim(), mode: 'insensitive' },
                    },
                  },
                },
              },
            },
          },
        },
      };
    }
  }
  if (Object.keys(studentFilters).length > 0) {
    and.push({ student: { is: studentFilters } });
  }

  if (query.scopeHostelNames && query.scopeHostelNames.length > 0) {
    and.push({ student: { is: studentAllocatedToHostelsWhere(query.scopeHostelNames) } });
  }

  const where: Prisma.UserWhereInput = {
    ...studentUserWhere(),
    ...(query.status ? statusWhere(query.status) : {}),
    ...(and.length > 0 ? { AND: and } : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: safeLimit,
      orderBy: [{ createdAt: 'desc' }],
      include: {
        student: {
          include: {
            allocationRecords: allocationInclude,
          },
        },
      },
    }),
  ]);

  return {
    students: rows.map((row) => rowFromUser(row, env)),
    pagination: buildPaginationMeta(safePage, safeLimit, total),
  };
}

export type AdminStudentProfile = {
  userId: string;
  directoryStatus: StudentDirectoryUiStatus;
  account: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    userStatus: UserStatus;
    isVerified: boolean;
    mfaEnabled: boolean;
    mustChangePassword: boolean;
    joinedAt: string;
    profilePhotoUrl: string | null;
  };
  student: null | {
    id: string;
    registrationNumber: string;
    course: string;
    department: string;
    academicYear: string;
    currentSemester: string;
    gender: string;
    dateOfBirth: string;
    bloodGroup: string | null;
    medicalAlerts: string | null;
    permanentAddress: string;
    guardianName: string;
    guardianPhone: string;
    guardianRelation: string;
  };
  housing: null | {
    hostelName: string;
    roomNumber: string;
    bedNumber: string;
    allocatedSince: string;
  };
};

export async function getAdminStudentProfile(
  prisma: PrismaClient,
  env: Env,
  userId: string,
): Promise<AdminStudentProfile> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      student: {
        include: {
          allocationRecords: allocationInclude,
        },
      },
    },
  });

  if (!user || user.role !== 'STUDENT') {
    throw new NotFoundError('Student not found.');
  }

  const allocation = user.student?.allocationRecords[0];
  const hostelName = allocation?.bed.room.floor.block.building.hostel.name;

  return {
    userId: user.id,
    directoryStatus: mapDirectoryStatus(user.status, user.isVerified),
    account: {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phoneNumber,
      userStatus: user.status,
      isVerified: user.isVerified,
      mfaEnabled: user.mfaEnabled,
      mustChangePassword: user.mustChangePassword,
      joinedAt: user.createdAt.toISOString(),
      profilePhotoUrl: user.profilePhotoKey
        ? buildPublicProfilePhotoUrl(env, user.profilePhotoKey)
        : null,
    },
    student: user.student
      ? {
          id: user.student.id,
          registrationNumber: user.student.registrationNumber,
          course: user.student.course,
          department: user.student.department,
          academicYear: user.student.academicYear,
          currentSemester: user.student.currentSemester,
          gender: user.student.gender,
          dateOfBirth: user.student.dateOfBirth.toISOString().slice(0, 10),
          bloodGroup: user.student.bloodGroup,
          medicalAlerts: user.student.medicalAlerts,
          permanentAddress: user.student.permanentAddress,
          guardianName: user.student.guardianName,
          guardianPhone: user.student.guardianPhone,
          guardianRelation: user.student.guardianRelation,
        }
      : null,
    housing:
      allocation && hostelName
        ? {
            hostelName,
            roomNumber: allocation.bed.room.roomNumber,
            bedNumber: allocation.bed.bedNumber,
            allocatedSince: allocation.startDate.toISOString().slice(0, 10),
          }
        : null,
  };
}

function mapUiGenderToDb(gender: RegisterStudentBody['gender']): StudentGender {
  if (gender === 'Female') {
    return 'FEMALE';
  }
  if (gender === 'Male') {
    return 'MALE';
  }
  throw new BadRequestError('Only Male and Female are supported for student gender at this time.');
}

function formatPermanentAddress(input: RegisterStudentBody): string {
  const lines = [
    input.fullAddress,
    [input.city, input.state, input.pinCode].filter(Boolean).join(', '),
    input.country,
  ].filter((line) => line.trim().length > 0);
  return lines.join('\n');
}

export type RegisterStudentResult = {
  userId: string;
  studentId: string;
  registrationNumber: string;
  loginEmail: string;
};

/** Creates User (STUDENT) + Student row and sends activation email (no bed allocation yet). */
export async function registerStudentByAdmin(
  prisma: PrismaClient,
  env: Env,
  actorUserId: string,
  actorRole: string,
  input: RegisterStudentBody,
  ip: string | undefined,
): Promise<RegisterStudentResult> {
  const loginEmail = repo.normalizeEmail(input.loginEmail);
  const existing = await repo.findUserByEmail(prisma, loginEmail);
  if (existing) {
    throw new BadRequestError('A user with this login email already exists.');
  }

  const regNumber = input.registrationNumber.trim();
  const regTaken = await prisma.student.findUnique({
    where: { registrationNumber: regNumber },
    select: { id: true },
  });
  if (regTaken) {
    throw new BadRequestError('This registration / roll number is already in use.');
  }

  const dob = new Date(`${input.dateOfBirth}T00:00:00.000Z`);
  if (Number.isNaN(dob.getTime())) {
    throw new BadRequestError('Invalid date of birth.');
  }

  const department = (input.college?.trim() || input.course).slice(0, 100);
  const gender = mapUiGenderToDb(input.gender);
  const placeholderHash = await argon2.hash(createOpaqueToken(), argon2ParamsFromEnv(env));

  const profilePhotoKey = input.profilePhotoObjectKey?.trim() || null;
  if (profilePhotoKey) {
    if (!isSafeObjectKey(profilePhotoKey)) {
      throw new BadRequestError('Invalid profile photo reference.');
    }
    await assertObjectExists(env, 'public', profilePhotoKey);
  }

  const documentUploads = input.documentUploads ?? [];
  for (const doc of documentUploads) {
    if (!isSafeObjectKey(doc.objectKey)) {
      throw new BadRequestError('Invalid document reference.');
    }
    await assertObjectExists(env, 'private', doc.objectKey);
  }

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email: loginEmail,
        passwordHash: placeholderHash,
        role: 'STUDENT',
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        phoneNumber: input.phone.trim(),
        status: 'INACTIVE',
        isVerified: false,
        profilePhotoKey,
      },
    });

    const student = await tx.student.create({
      data: {
        userId: created.id,
        registrationNumber: regNumber,
        course: input.course.trim(),
        department,
        academicYear: input.academicYear.trim(),
        currentSemester: (input.currentSemester?.trim() || '1').slice(0, 20),
        gender,
        dateOfBirth: dob,
        guardianName: input.guardianName.trim(),
        guardianPhone: input.guardianPhone.trim(),
        guardianRelation: input.relationship.trim(),
        permanentAddress: formatPermanentAddress(input),
      },
    });

    if (documentUploads.length > 0) {
      await tx.studentDocument.createMany({
        data: documentUploads.map((doc) => ({
          studentId: student.id,
          objectKey: doc.objectKey,
          fileName: doc.fileName,
          mimeType: doc.mimeType,
          fileSize: doc.fileSize,
        })),
      });
    }

    return { user: created, student };
  });

  const { rawToken } = await repo.issueEmailActionToken(prisma, user.user.id, 'activation');

  try {
    await mailService.sendAccountActivationLink(env, loginEmail, rawToken);
  } catch {
    await prisma.$transaction(async (tx) => {
      await tx.student.delete({ where: { id: user.student.id } });
      await tx.user.delete({ where: { id: user.user.id } });
    });
    throw new InternalError('Email delivery is not available. Try again later.');
  }

  await auditService.logAuditEvent(prisma, {
    actorUserId,
    actorRole,
    actionName: 'STUDENT_REGISTERED',
    entityType: 'Student',
    entityId: user.student.id,
    ipAddress: ip ?? null,
  });

  return {
    userId: user.user.id,
    studentId: user.student.id,
    registrationNumber: user.student.registrationNumber,
    loginEmail,
  };
}
