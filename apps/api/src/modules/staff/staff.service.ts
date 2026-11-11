import type { Prisma, PrismaClient, Role, UserStatus } from '@nestora/database';
import type { RegisterStaffBody, StaffDirectoryListQuery } from '@nestora/validators';
import * as argon2 from 'argon2';
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from '../../common/constants/limits.js';
import {
  BadRequestError,
  InternalError,
  NotFoundError,
} from '../../common/errors/index.js';
import { buildPaginationMeta, normalizePagination } from '../../common/helpers/index.js';
import type { Env } from '../../config/index.js';
import { createOpaqueToken } from '../../lib/crypto-token.js';
import * as auditService from '../audit/audit.service.js';
import * as repo from '../auth/auth.repository.js';
import { argon2ParamsFromEnv } from '../auth/password.service.js';
import * as mailService from '../auth/mail.service.js';
import { isSafeObjectKey } from '../storage/object-key.js';
import { assertObjectExists, buildPublicStaffPhotoUrl } from '../storage/storage.service.js';

export type StaffDirectoryUiStatus = 'Active' | 'On Leave' | 'Inactive';

export type StaffDirectorySummary = {
  generatedAt: string;
  total: number;
  active: number;
  onLeave: number;
  inactive: number;
  activeRatePercent: number | null;
  createdThisMonth: number;
  facets: {
    roles: string[];
    departments: string[];
    hostels: string[];
  };
};

export type StaffDirectoryRow = {
  id: string;
  staffId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  hostel: string;
  status: StaffDirectoryUiStatus;
  joinedDate: string;
};

const STAFF_ROLES: Role[] = ['HOSTEL_WARDEN', 'HOSTEL_STAFF', 'SECURITY_GUARD', 'ACCOUNTANT'];

function startOfUtcMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function staffUserWhere(variant?: 'all' | 'wardens'): Prisma.UserWhereInput {
  if (variant === 'wardens') {
    return { role: 'HOSTEL_WARDEN' };
  }
  return { role: { in: STAFF_ROLES } };
}

function defaultRoleLabel(role: Role): string {
  switch (role) {
    case 'HOSTEL_WARDEN':
      return 'Warden';
    case 'HOSTEL_STAFF':
      return 'Hostel Staff';
    case 'SECURITY_GUARD':
      return 'Security Supervisor';
    case 'ACCOUNTANT':
      return 'Accounts Officer';
    default:
      return role;
  }
}

function mapStaffStatus(status: UserStatus): StaffDirectoryUiStatus {
  if (status === 'ACTIVE') {
    return 'Active';
  }
  return 'Inactive';
}

function statusWhere(uiStatus: StaffDirectoryUiStatus): Prisma.UserWhereInput {
  switch (uiStatus) {
    case 'Active':
      return { status: 'ACTIVE' };
    case 'On Leave':
      return { id: { in: [] } };
    case 'Inactive':
      return {
        OR: [{ status: 'SUSPENDED' }, { status: 'INACTIVE' }],
      };
    default:
      return {};
  }
}

function roleLabelToEnum(label: string): Role | null {
  const key = label.trim().toLowerCase();
  if (key === 'warden') {
    return 'HOSTEL_WARDEN';
  }
  if (key === 'hostel staff') {
    return 'HOSTEL_STAFF';
  }
  if (key === 'security supervisor') {
    return 'SECURITY_GUARD';
  }
  if (key === 'accounts officer') {
    return 'ACCOUNTANT';
  }
  return null;
}

const hostelAssignmentInclude = {
  take: 1,
  orderBy: { assignedAt: 'desc' as const },
  include: {
    hostel: { select: { name: true } },
  },
};

function rowFromUser(
  u: Prisma.UserGetPayload<{
    include: {
      staffProfile: true;
      hostelAssignments: typeof hostelAssignmentInclude;
      wardenInChargeHostels: { select: { name: true }; take: 1 };
    };
  }>,
): StaffDirectoryRow {
  const profile = u.staffProfile;
  const roleLabel = profile?.designation?.trim() || defaultRoleLabel(u.role);
  const department = profile?.department?.trim() || '—';
  const assignmentHostel = u.hostelAssignments[0]?.hostel.name;
  const wardenHostel = u.wardenInChargeHostels[0]?.name;
  const hostel = wardenHostel ?? assignmentHostel ?? 'Central Office';

  return {
    id: u.id,
    staffId:
      profile?.employeeNumber?.trim() ||
      (profile?.id ? `STF-${profile.id.slice(0, 8).toUpperCase()}` : `STF-${u.id.slice(0, 8).toUpperCase()}`),
    name: `${u.firstName} ${u.lastName}`.trim(),
    email: u.email,
    phone: u.phoneNumber?.trim() || '—',
    role: roleLabel,
    department,
    hostel,
    status: mapStaffStatus(u.status),
    joinedDate: u.createdAt.toISOString().slice(0, 10),
  };
}

export async function getStaffDirectorySummary(
  prisma: PrismaClient,
  variant: 'all' | 'wardens' = 'all',
): Promise<StaffDirectorySummary> {
  const base = staffUserWhere(variant);
  const monthStart = startOfUtcMonth(new Date());

  const [total, active, inactive, createdThisMonth, profileRows, hostelRows] = await Promise.all([
    prisma.user.count({ where: base }),
    prisma.user.count({ where: { ...base, status: 'ACTIVE' } }),
    prisma.user.count({
      where: {
        ...base,
        OR: [{ status: 'SUSPENDED' }, { status: 'INACTIVE' }],
      },
    }),
    prisma.user.count({ where: { ...base, createdAt: { gte: monthStart } } }),
    prisma.staffProfile.findMany({
      where: { user: { is: base } },
      select: { designation: true, department: true },
    }),
    prisma.hostel.findMany({
      where: { isActive: true },
      select: { name: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  const onLeave = 0;
  const activeRatePercent = total > 0 ? Math.round((active / total) * 1000) / 10 : null;

  const roles = new Set<string>();
  const departments = new Set<string>();
  for (const row of profileRows) {
    if (row.designation?.trim()) {
      roles.add(row.designation.trim());
    }
    if (row.department?.trim()) {
      departments.add(row.department.trim());
    }
  }
  for (const role of variant === 'wardens' ? ['Warden'] : ['Warden', 'Hostel Staff', 'Security Supervisor', 'Accounts Officer']) {
    roles.add(role);
  }

  return {
    generatedAt: new Date().toISOString(),
    total,
    active,
    onLeave,
    inactive,
    activeRatePercent,
    createdThisMonth,
    facets: {
      roles: [...roles].sort(),
      departments: [...departments].sort(),
      hostels: ['Central Office', ...hostelRows.map((h) => h.name)],
    },
  };
}

export async function listStaffDirectory(
  prisma: PrismaClient,
  query: StaffDirectoryListQuery,
): Promise<{
  staff: StaffDirectoryRow[];
  pagination: ReturnType<typeof buildPaginationMeta>;
}> {
  const variant = query.variant ?? 'all';
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
          staffProfile: {
            OR: [
              { designation: { contains: term, mode: 'insensitive' } },
              { department: { contains: term, mode: 'insensitive' } },
            ],
          },
        },
      ],
    });
  }

  if (query.status) {
    and.push(statusWhere(query.status));
  }

  if (query.role?.trim() && query.role !== 'All Roles') {
    const roleLabel = query.role.trim();
    const roleEnum = roleLabelToEnum(roleLabel);
    const roleClauses: Prisma.UserWhereInput[] = [
      { staffProfile: { is: { designation: { equals: roleLabel, mode: 'insensitive' } } } },
    ];
    if (roleEnum) {
      roleClauses.push({ role: roleEnum });
    }
    and.push({ OR: roleClauses });
  }

  if (query.department?.trim() && query.department !== 'All Departments') {
    and.push({
      staffProfile: { is: { department: { equals: query.department.trim(), mode: 'insensitive' } } },
    });
  }

  if (query.hostel?.trim() && query.hostel !== 'All Locations') {
    const hostel = query.hostel.trim();
    if (hostel === 'Central Office') {
      and.push({
        hostelAssignments: { none: {} },
        wardenInChargeHostels: { none: {} },
      });
    } else {
      and.push({
        OR: [
          { hostelAssignments: { some: { hostel: { name: { equals: hostel, mode: 'insensitive' } } } } },
          { wardenInChargeHostels: { some: { name: { equals: hostel, mode: 'insensitive' } } } },
        ],
      });
    }
  }

  const where: Prisma.UserWhereInput = {
    ...staffUserWhere(variant),
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
        staffProfile: true,
        hostelAssignments: hostelAssignmentInclude,
        wardenInChargeHostels: { select: { name: true }, take: 1 },
      },
    }),
  ]);

  const staff = rows.map(rowFromUser);

  return {
    staff,
    pagination: buildPaginationMeta(safePage, safeLimit, total),
  };
}

function mapJobTitleToRole(jobTitle: string): Role {
  const title = jobTitle.trim().toLowerCase();
  if (title === 'accountant') {
    return 'ACCOUNTANT';
  }
  if (title === 'security guard') {
    return 'SECURITY_GUARD';
  }
  if (title === 'warden' || title === 'assistant warden' || title === 'hostel manager') {
    return 'HOSTEL_WARDEN';
  }
  return 'HOSTEL_STAFF';
}

function resolveStaffAccountState(
  accountStatus: RegisterStaffBody['accountStatus'],
  sendInvitation: boolean,
): { status: UserStatus; isVerified: boolean } {
  if (accountStatus === 'Inactive') {
    return { status: 'INACTIVE', isVerified: false };
  }
  if (sendInvitation) {
    return { status: 'INACTIVE', isVerified: false };
  }
  if (accountStatus === 'Active') {
    return { status: 'ACTIVE', isVerified: true };
  }
  return { status: 'INACTIVE', isVerified: false };
}

function formatStaffPermanentAddress(input: RegisterStaffBody): string {
  const lines = [
    input.fullAddress,
    [input.city, input.state, input.pinCode].filter(Boolean).join(', '),
    input.country,
  ].filter((line) => line.trim().length > 0);
  return lines.join('\n');
}

function formatSystemRoleLabel(role: Role): string {
  switch (role) {
    case 'HOSTEL_WARDEN':
      return 'Hostel warden';
    case 'HOSTEL_STAFF':
      return 'Hostel staff';
    case 'SECURITY_GUARD':
      return 'Security guard';
    case 'ACCOUNTANT':
      return 'Accountant';
    default:
      return role.replace(/_/g, ' ').toLowerCase();
  }
}

async function resolveHostelId(
  prisma: PrismaClient,
  assignedHostel: string | undefined,
): Promise<string | null> {
  const label = assignedHostel?.trim();
  if (!label || label === 'Central Office' || label === 'All Hostels' || label === '—') {
    return null;
  }
  const hostel = await prisma.hostel.findFirst({
    where: { name: { equals: label, mode: 'insensitive' }, isActive: true },
    select: { id: true },
  });
  if (hostel) {
    return hostel.id;
  }
  const fuzzy = await prisma.hostel.findFirst({
    where: { name: { contains: label.split(' ')[0] ?? label, mode: 'insensitive' }, isActive: true },
    select: { id: true },
  });
  return fuzzy?.id ?? null;
}

export type AdminStaffProfile = {
  userId: string;
  directoryStatus: StaffDirectoryUiStatus;
  profilePhotoUrl: string | null;
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
    systemRole: Role;
    systemRoleLabel: string;
  };
  staff: null | {
    id: string;
    employeeNumber: string | null;
    designation: string;
    department: string;
    shiftPreference: string | null;
    employmentType: string | null;
    joiningDate: string | null;
    identityProofType: string | null;
    identityProofNumber: string | null;
    emergencyContactName: string | null;
    emergencyRelationship: string | null;
    emergencyContactPhone: string | null;
    permanentAddress: string | null;
    documents: Array<{
      id: string;
      kind: string;
      fileName: string;
      mimeType: string;
      fileSize: number;
      uploadedAt: string;
      objectKey: string;
    }>;
  };
  assignment: null | {
    hostelName: string;
    assignedAt: string;
  };
  wardenOf: string | null;
};

export async function getAdminStaffProfile(
  prisma: PrismaClient,
  env: Env,
  userId: string,
): Promise<AdminStaffProfile> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      staffProfile: {
        include: {
          documents: { orderBy: { uploadedAt: 'desc' } },
        },
      },
      hostelAssignments: {
        take: 1,
        orderBy: { assignedAt: 'desc' },
        include: { hostel: { select: { name: true } } },
      },
      wardenInChargeHostels: { take: 1, select: { name: true } },
    },
  });

  if (!user || !STAFF_ROLES.includes(user.role)) {
    throw new NotFoundError('Staff member not found.');
  }

  const profilePhotoUrl = user.profilePhotoKey
    ? buildPublicStaffPhotoUrl(env, user.profilePhotoKey)
    : null;

  const profile = user.staffProfile;

  return {
    userId: user.id,
    directoryStatus: mapStaffStatus(user.status),
    profilePhotoUrl,
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
      systemRole: user.role,
      systemRoleLabel: formatSystemRoleLabel(user.role),
    },
    staff: profile
      ? {
          id: profile.id,
          employeeNumber: profile.employeeNumber,
          designation: profile.designation,
          department: profile.department,
          shiftPreference: profile.shiftPreference,
          employmentType: profile.employmentType,
          joiningDate: profile.joiningDate ? profile.joiningDate.toISOString().slice(0, 10) : null,
          identityProofType: profile.identityProofType,
          identityProofNumber: profile.identityProofNumber,
          emergencyContactName: profile.emergencyContactName,
          emergencyRelationship: profile.emergencyRelationship,
          emergencyContactPhone: profile.emergencyContactPhone,
          permanentAddress: profile.permanentAddress,
          documents: profile.documents.map((doc) => ({
            id: doc.id,
            kind: doc.documentKind,
            fileName: doc.fileName,
            mimeType: doc.mimeType,
            fileSize: doc.fileSize,
            uploadedAt: doc.uploadedAt.toISOString(),
            objectKey: doc.objectKey,
          })),
        }
      : null,
    assignment: user.hostelAssignments[0]
      ? {
          hostelName: user.hostelAssignments[0].hostel.name,
          assignedAt: user.hostelAssignments[0].assignedAt.toISOString().slice(0, 10),
        }
      : null,
    wardenOf: user.wardenInChargeHostels[0]?.name ?? null,
  };
}

export type RegisterStaffResult = {
  userId: string;
  staffProfileId: string;
  employeeNumber: string;
  loginEmail: string;
};

export async function registerStaffByAdmin(
  prisma: PrismaClient,
  env: Env,
  actorUserId: string,
  actorRole: string,
  input: RegisterStaffBody,
  ip: string | undefined,
): Promise<RegisterStaffResult> {
  const loginEmail = repo.normalizeEmail(input.loginEmail);
  const existingUser = await repo.findUserByEmail(prisma, loginEmail);
  if (existingUser) {
    throw new BadRequestError('A user with this login email already exists.');
  }

  const employeeNumber = input.employeeNumber.trim();
  const existingEmp = await prisma.staffProfile.findUnique({
    where: { employeeNumber },
    select: { id: true },
  });
  if (existingEmp) {
    throw new BadRequestError('This employee ID is already in use.');
  }

  const profilePhotoKey = input.profilePhotoObjectKey?.trim() || null;
  if (profilePhotoKey) {
    if (!isSafeObjectKey(profilePhotoKey)) {
      throw new BadRequestError('Invalid profile photo reference.');
    }
    await assertObjectExists(env, 'staffPublic', profilePhotoKey);
  }

  const documentUploads = input.documentUploads ?? [];
  for (const doc of documentUploads) {
    if (!isSafeObjectKey(doc.objectKey)) {
      throw new BadRequestError('Invalid document reference.');
    }
    await assertObjectExists(env, 'staffPrivate', doc.objectKey);
  }

  const role = mapJobTitleToRole(input.jobTitle);
  const account = resolveStaffAccountState(input.accountStatus, input.sendInvitation);
  const placeholderHash = await argon2.hash(createOpaqueToken(), argon2ParamsFromEnv(env));
  const hostelId = await resolveHostelId(prisma, input.assignedHostel);

  const created = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: loginEmail,
        passwordHash: placeholderHash,
        role,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        phoneNumber: input.phone.trim(),
        status: account.status,
        isVerified: account.isVerified,
        profilePhotoKey,
      },
    });

    const joiningDate = new Date(`${input.joiningDate}T00:00:00.000Z`);
    const profile = await tx.staffProfile.create({
      data: {
        userId: user.id,
        employeeNumber,
        department: input.department.trim(),
        designation: input.jobTitle.trim(),
        shiftPreference: input.workShift.trim(),
        employmentType: input.employmentType.trim(),
        joiningDate: Number.isNaN(joiningDate.getTime()) ? null : joiningDate,
        identityProofType: input.identityProofType.trim(),
        identityProofNumber: input.identityProofNumber.trim(),
        emergencyContactName: input.emergencyContactName.trim(),
        emergencyRelationship: input.emergencyRelationship.trim(),
        emergencyContactPhone: input.emergencyContactPhone.trim(),
        permanentAddress: formatStaffPermanentAddress(input),
      },
    });

    if (documentUploads.length > 0) {
      await tx.staffDocument.createMany({
        data: documentUploads.map((doc) => ({
          staffProfileId: profile.id,
          documentKind: doc.kind,
          objectKey: doc.objectKey,
          fileName: doc.fileName,
          mimeType: doc.mimeType,
          fileSize: doc.fileSize,
        })),
      });
    }

    if (hostelId) {
      await tx.hostelAssignment.create({
        data: {
          userId: user.id,
          hostelId,
          assignedBy: actorUserId,
        },
      });
      if (role === 'HOSTEL_WARDEN') {
        await tx.hostel.updateMany({
          where: { id: hostelId, wardenInCharge: null },
          data: { wardenInCharge: user.id },
        });
      }
    }

    return { user, profile };
  });

  if (input.sendInvitation && input.accountStatus !== 'Inactive') {
    const { rawToken } = await repo.issueEmailActionToken(prisma, created.user.id, 'activation');
    try {
      await mailService.sendAccountActivationLink(env, loginEmail, rawToken);
    } catch {
      await prisma.$transaction(async (tx) => {
        await tx.staffDocument.deleteMany({ where: { staffProfileId: created.profile.id } });
        await tx.staffProfile.delete({ where: { id: created.profile.id } });
        await tx.hostelAssignment.deleteMany({ where: { userId: created.user.id } });
        await tx.user.delete({ where: { id: created.user.id } });
      });
      throw new InternalError('Email delivery is not available. Try again later.');
    }
  }

  await auditService.logAuditEvent(prisma, {
    actorUserId,
    actorRole,
    actionName: 'STAFF_REGISTERED',
    entityType: 'StaffProfile',
    entityId: created.profile.id,
    ipAddress: ip ?? null,
  });

  return {
    userId: created.user.id,
    staffProfileId: created.profile.id,
    employeeNumber,
    loginEmail,
  };
}
