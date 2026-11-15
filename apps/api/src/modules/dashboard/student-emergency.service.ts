import { createHash } from 'node:crypto';
import type { Prisma, PrismaClient } from '@nestora/database';
import type { StudentReportIncidentBody } from '@nestora/validators';
import { BadRequestError } from '../../common/errors/index.js';
import { deriveNoticeStatus, mapCategory } from '../announcements/announcements.service.js';
import {
  createStudentIncidentReport,
  type IncidentUiSeverity,
  type IncidentUiType,
} from '../incidents/incidents.service.js';
import { ensureStudentProfileForUser } from '../students/student-profile-ensure.service.js';

export const STUDENT_INCIDENT_TYPES = [
  'Fire',
  'Medical',
  'Security',
  'Missing student',
  'Infrastructure',
  'Other',
] as const satisfies readonly IncidentUiType[];

export const STUDENT_INCIDENT_SEVERITIES = [
  'Low',
  'Medium',
  'High',
  'Critical',
] as const satisfies readonly IncidentUiSeverity[];

export type EmergencyContactCard = {
  id: string;
  category: 'personal' | 'hostel' | 'campus';
  role: string;
  name: string;
  phone: string | null;
  email: string | null;
  note: string | null;
  telHref: string | null;
};

export type StudentEmergencyNotice = {
  id: string;
  title: string;
  body: string;
  publishedLabel: string;
};

export type StudentEmergencyReportRow = {
  id: string;
  incidentRef: string;
  title: string;
  status: string;
  statusLabel: string;
  severity: string;
  submittedAt: string;
};

export type StudentEmergencyDesk = {
  generatedAt: string;
  profileLinked: boolean;
  hostelName: string | null;
  hostelId: string | null;
  medicalAlert: string | null;
  canReport: boolean;
  contacts: EmergencyContactCard[];
  campusHotlines: EmergencyContactCard[];
  emergencyNotices: StudentEmergencyNotice[];
  myReports: StudentEmergencyReportRow[];
  incidentTypes: readonly string[];
  incidentSeverities: readonly string[];
};

const CAMPUS_HOTLINES: EmergencyContactCard[] = [
  {
    id: 'hotline-112',
    category: 'campus',
    role: 'National emergency',
    name: 'ERSS (112)',
    phone: '112',
    email: null,
    note: 'Police, fire, medical — unified emergency',
    telHref: 'tel:112',
  },
  {
    id: 'hotline-108',
    category: 'campus',
    role: 'Ambulance',
    name: 'Medical (108)',
    phone: '108',
    email: null,
    note: 'Ambulance & medical dispatch',
    telHref: 'tel:108',
  },
  {
    id: 'hotline-101',
    category: 'campus',
    role: 'Fire',
    name: 'Fire brigade (101)',
    phone: '101',
    email: null,
    note: 'Fire emergency',
    telHref: 'tel:101',
  },
];

function telHref(phone: string | null | undefined): string | null {
  if (!phone?.trim()) return null;
  const digits = phone.replace(/[^\d+]/g, '');
  return digits.length >= 6 ? `tel:${digits}` : null;
}

function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function noticeWhereForStudent(hostelId: string | null, now: Date): Prisma.NoticeWhereInput {
  return {
    OR: hostelId ? [{ hostelId: null }, { hostelId }] : [{ hostelId: null }],
    AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] }],
  };
}

const emptyDesk = (now: Date): StudentEmergencyDesk => ({
  generatedAt: now.toISOString(),
  profileLinked: false,
  hostelName: null,
  hostelId: null,
  medicalAlert: null,
  canReport: false,
  contacts: [],
  campusHotlines: CAMPUS_HOTLINES,
  emergencyNotices: [],
  myReports: [],
  incidentTypes: STUDENT_INCIDENT_TYPES,
  incidentSeverities: STUDENT_INCIDENT_SEVERITIES,
});

export async function getStudentEmergencyDesk(
  prisma: PrismaClient,
  userId: string,
): Promise<StudentEmergencyDesk> {
  const now = new Date();
  await ensureStudentProfileForUser(prisma, userId);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      email: true,
      student: {
        select: {
          id: true,
          guardianName: true,
          guardianPhone: true,
          guardianRelation: true,
          medicalAlerts: true,
        },
      },
    },
  });

  if (!user?.student) {
    return emptyDesk(now);
  }

  const allocation = await prisma.allocationRecord.findFirst({
    where: { studentId: user.student.id, status: 'ACTIVE' },
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
  });

  const hostel = allocation?.bed.room.floor.block.building.hostel;
  const hostelId = hostel?.id ?? null;
  const hostelName = hostel?.name ?? null;

  const [staffAssignments, noticeRows, myIncidents] = await Promise.all([
    hostelId
      ? prisma.hostelAssignment.findMany({
          where: { hostelId },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
                email: true,
                role: true,
              },
            },
          },
          take: 12,
        })
      : Promise.resolve([]),
    prisma.notice.findMany({
      where: {
        AND: [
          noticeWhereForStudent(hostelId, now),
          {
            OR: [
              { category: { equals: 'Emergency', mode: 'insensitive' } },
              { category: { contains: 'emerg', mode: 'insensitive' } },
            ],
          },
        ],
      },
      orderBy: { publishedAt: 'desc' },
      take: 6,
      select: { id: true, title: true, description: true, publishedAt: true, expiresAt: true, category: true },
    }),
    prisma.emergencyIncident.findMany({
      where: { reportedBy: userId },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: {
        hostel: { select: { name: true } },
      },
    }),
  ]);

  const contacts: EmergencyContactCard[] = [];

  contacts.push({
    id: 'guardian',
    category: 'personal',
    role: user.student.guardianRelation || 'Guardian',
    name: user.student.guardianName,
    phone: user.student.guardianPhone,
    email: null,
    note: 'Update in profile if this number changes',
    telHref: telHref(user.student.guardianPhone),
  });

  const selfName = `${user.firstName} ${user.lastName}`.trim();
  contacts.push({
    id: 'self',
    category: 'personal',
    role: 'Your mobile',
    name: selfName || 'You',
    phone: user.phoneNumber,
    email: user.email,
    note: 'Number on your Nestora account',
    telHref: telHref(user.phoneNumber),
  });

  if (hostel?.warden) {
    const w = hostel.warden;
    contacts.push({
      id: `warden-${w.id}`,
      category: 'hostel',
      role: 'Hostel warden',
      name: `${w.firstName} ${w.lastName}`.trim(),
      phone: w.phoneNumber,
      email: w.email,
      note: hostelName ? `In charge · ${hostelName}` : 'Hostel warden',
      telHref: telHref(w.phoneNumber),
    });
  }

  if (hostel?.university.contactEmail) {
    contacts.push({
      id: 'university-desk',
      category: 'hostel',
      role: 'University desk',
      name: hostel.university.name,
      phone: null,
      email: hostel.university.contactEmail,
      note: 'Official university contact',
      telHref: null,
    });
  }

  for (const assignment of staffAssignments) {
    const u = assignment.user;
    if (u.role !== 'HOSTEL_STAFF' && u.role !== 'SECURITY_GUARD') continue;
    const roleLabel = u.role === 'SECURITY_GUARD' ? 'Security / gate' : 'Hostel staff';
    contacts.push({
      id: `staff-${u.id}`,
      category: 'hostel',
      role: roleLabel,
      name: `${u.firstName} ${u.lastName}`.trim(),
      phone: u.phoneNumber,
      email: u.email,
      note: hostelName ?? 'Assigned to your hostel',
      telHref: telHref(u.phoneNumber),
    });
  }

  const emergencyNotices: StudentEmergencyNotice[] = noticeRows
    .filter((row) => mapCategory(row.category) === 'Emergency' || row.category.toLowerCase().includes('emerg'))
    .filter((row) => deriveNoticeStatus(row, now) !== 'Expired')
    .map((row) => ({
      id: row.id,
      title: row.title,
      body: row.description,
      publishedLabel: formatTimestamp(row.publishedAt),
    }));

  const myReports: StudentEmergencyReportRow[] = myIncidents.map((row) => {
    const ref = incidentRef(row.id, row.createdAt);
    const status = row.status.replace(/_/g, ' ').toLowerCase();
    const statusLabel = status.replace(/\b\w/g, (c) => c.toUpperCase());
    const sev = (row.officialSeverity ?? row.initialSeverity).toLowerCase();
    const severity = sev.replace(/\b\w/g, (c) => c.toUpperCase());
    return {
      id: row.id,
      incidentRef: ref,
      title: row.title,
      status: row.status,
      statusLabel,
      severity,
      submittedAt: formatTimestamp(row.createdAt),
    };
  });

  return {
    generatedAt: now.toISOString(),
    profileLinked: true,
    hostelName,
    hostelId,
    medicalAlert: user.student.medicalAlerts?.trim() || null,
    canReport: Boolean(hostelId),
    contacts,
    campusHotlines: CAMPUS_HOTLINES,
    emergencyNotices,
    myReports,
    incidentTypes: STUDENT_INCIDENT_TYPES,
    incidentSeverities: STUDENT_INCIDENT_SEVERITIES,
  };
}

function incidentRef(id: string, createdAt: Date): string {
  const short = createHash('sha256').update(id).digest('hex').slice(0, 4).toUpperCase();
  return `INC-${createdAt.getUTCFullYear()}-${short}`;
}

export async function reportStudentEmergency(
  prisma: PrismaClient,
  userId: string,
  body: StudentReportIncidentBody,
): Promise<StudentEmergencyDesk> {
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
                  block: { include: { building: { include: { hostel: { select: { id: true } } } } } },
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
    throw new BadRequestError('You need an active hostel allocation before reporting an emergency.');
  }

  await createStudentIncidentReport(prisma, userId, hostelId, body);
  return getStudentEmergencyDesk(prisma, userId);
}