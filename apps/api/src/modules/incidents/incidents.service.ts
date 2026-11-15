import type { Prisma, PrismaClient } from '@nestora/database';
import type {
  IncidentActionBody,
  IncidentsDeskListQuery,
  PatchIncidentSeverityBody,
  ResolveIncidentBody,
  StaffReportIncidentBody,
} from '@nestora/validators';
import { createHash } from 'node:crypto';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../common/errors/index.js';
import { hostelNameInScope } from '../../common/helpers/warden-hostel-scope.js';
import { notifyIncidentReported } from '../notifications/notification-events.service.js';

export type IncidentUiType =
  | 'Fire'
  | 'Medical'
  | 'Security'
  | 'Missing student'
  | 'Infrastructure'
  | 'Other';

export type IncidentUiSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export type IncidentUiStatus = 'Reported' | 'Acknowledged' | 'In progress' | 'Resolved';

export type IncidentDeskRecord = {
  id: string;
  incidentRef: string;
  title: string;
  description: string;
  incidentType: IncidentUiType;
  location: string;
  hostel: string;
  reportedByName: string;
  initialSeverity: IncidentUiSeverity;
  officialSeverity: IncidentUiSeverity | null;
  effectiveSeverity: IncidentUiSeverity;
  status: IncidentUiStatus;
  isEscalated: boolean;
  reportedAt: string;
  resolvedAt: string | null;
  updatedAt: string;
  lastActionAt: string | null;
};

export type IncidentActionLogEntry = {
  id: string;
  actionTaken: string;
  actorName: string;
  at: string;
};

export type IncidentsDeskSummary = {
  generatedAt: string;
  activeIncidents: number;
  unacknowledged: number;
  escalated: number;
  criticalOpen: number;
  resolvedThisWeek: number;
  facets: {
    hostels: string[];
    types: IncidentUiType[];
  };
};

const TYPE_TO_UI: Record<string, IncidentUiType> = {
  FIRE: 'Fire',
  MEDICAL: 'Medical',
  SECURITY: 'Security',
  MISSING_STUDENT: 'Missing student',
  INFRASTRUCTURE: 'Infrastructure',
  OTHER: 'Other',
};

const SEVERITY_TO_UI: Record<string, IncidentUiSeverity> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

const SEVERITY_TO_DB: Record<IncidentUiSeverity, string> = {
  Low: 'LOW',
  Medium: 'MEDIUM',
  High: 'HIGH',
  Critical: 'CRITICAL',
};

const TYPE_TO_DB: Record<IncidentUiType, string> = {
  Fire: 'FIRE',
  Medical: 'MEDICAL',
  Security: 'SECURITY',
  'Missing student': 'MISSING_STUDENT',
  Infrastructure: 'INFRASTRUCTURE',
  Other: 'OTHER',
};

const STATUS_TO_UI: Record<string, IncidentUiStatus> = {
  REPORTED: 'Reported',
  ACKNOWLEDGED: 'Acknowledged',
  IN_PROGRESS: 'In progress',
  RESOLVED: 'Resolved',
};

const incidentInclude = {
  hostel: { select: { name: true } },
  actionLogs: { orderBy: { createdAt: 'desc' as const }, take: 1 },
} satisfies Prisma.EmergencyIncidentInclude;

type IncidentRow = Prisma.EmergencyIncidentGetPayload<{ include: typeof incidentInclude }>;

function incidentRef(id: string, createdAt: Date): string {
  const short = createHash('sha256').update(id).digest('hex').slice(0, 4).toUpperCase();
  return `INC-${createdAt.getUTCFullYear()}-${short}`;
}

function mapType(value: string): IncidentUiType {
  return TYPE_TO_UI[value.toUpperCase()] ?? 'Other';
}

function mapSeverity(value: string): IncidentUiSeverity {
  return SEVERITY_TO_UI[value.toUpperCase()] ?? 'Medium';
}

function mapStatus(value: string): IncidentUiStatus {
  return STATUS_TO_UI[value.toUpperCase()] ?? 'Reported';
}

function hostelWhere(scopeHostelNames?: string[]): Prisma.EmergencyIncidentWhereInput {
  if (!scopeHostelNames?.length) return {};
  if (scopeHostelNames.length === 1) {
    return { hostel: { name: { equals: scopeHostelNames[0], mode: 'insensitive' } } };
  }
  return { hostel: { name: { in: scopeHostelNames, mode: 'insensitive' } } };
}

async function loadUserNames(prisma: PrismaClient, userIds: string[]): Promise<Map<string, string>> {
  if (userIds.length === 0) return new Map();
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, firstName: true, lastName: true, email: true },
  });
  return new Map(
    users.map((u) => [u.id, `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email || 'User']),
  );
}

function mapRow(row: IncidentRow, reporterNames: Map<string, string>): IncidentDeskRecord {
  const initialSeverity = mapSeverity(row.initialSeverity);
  const officialSeverity = row.officialSeverity ? mapSeverity(row.officialSeverity) : null;
  const lastLog = row.actionLogs[0];
  return {
    id: row.id,
    incidentRef: incidentRef(row.id, row.createdAt),
    title: row.title,
    description: row.description,
    incidentType: mapType(row.incidentType),
    location: row.location,
    hostel: row.hostel.name,
    reportedByName: reporterNames.get(row.reportedBy) ?? 'Reporter',
    initialSeverity,
    officialSeverity,
    effectiveSeverity: officialSeverity ?? initialSeverity,
    status: mapStatus(row.status),
    isEscalated: row.isEscalated,
    reportedAt: row.createdAt.toISOString(),
    resolvedAt: row.resolvedAt?.toISOString() ?? null,
    updatedAt: (lastLog?.createdAt ?? row.resolvedAt ?? row.createdAt).toISOString(),
    lastActionAt: lastLog?.createdAt.toISOString() ?? null,
  };
}

function matchesQuery(record: IncidentDeskRecord, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return (
    record.title.toLowerCase().includes(needle) ||
    record.incidentRef.toLowerCase().includes(needle) ||
    record.location.toLowerCase().includes(needle) ||
    record.reportedByName.toLowerCase().includes(needle) ||
    record.description.toLowerCase().includes(needle)
  );
}

function matchesFilters(record: IncidentDeskRecord, query: IncidentsDeskListQuery): boolean {
  if (!matchesQuery(record, query.q ?? '')) return false;
  if (query.hostel?.trim() && query.hostel !== 'All Hostels') {
    if (record.hostel.toLowerCase() !== query.hostel.trim().toLowerCase()) return false;
  }
  if (query.type?.trim() && query.type !== 'All Types') {
    if (record.incidentType !== query.type) return false;
  }
  if (query.severity?.trim() && query.severity !== 'All Severities') {
    if (record.effectiveSeverity !== query.severity) return false;
  }
  if (query.status?.trim() && query.status !== 'All Status') {
    if (record.status !== query.status) return false;
  }
  return true;
}

async function loadIncidents(prisma: PrismaClient, scopeHostelNames?: string[]): Promise<IncidentDeskRecord[]> {
  const rows = await prisma.emergencyIncident.findMany({
    where: hostelWhere(scopeHostelNames),
    include: incidentInclude,
    orderBy: { createdAt: 'desc' },
    take: 500,
  });
  const reporterIds = [...new Set(rows.map((r) => r.reportedBy))];
  const reporterNames = await loadUserNames(prisma, reporterIds);
  return rows.map((r) => mapRow(r, reporterNames));
}

export async function getIncidentsDeskSummary(
  prisma: PrismaClient,
  scopeHostelNames?: string[],
  hostelFilter?: string,
): Promise<IncidentsDeskSummary> {
  const records = await loadIncidents(prisma, scopeHostelNames);
  const scoped =
    hostelFilter && hostelFilter !== 'All Hostels'
      ? records.filter((r) => hostelNameInScope(r.hostel, [hostelFilter]))
      : records;

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  let activeIncidents = 0;
  let unacknowledged = 0;
  let escalated = 0;
  let criticalOpen = 0;
  let resolvedThisWeek = 0;

  for (const record of scoped) {
    if (record.status !== 'Resolved') {
      activeIncidents += 1;
      if (record.status === 'Reported') unacknowledged += 1;
      if (record.isEscalated) escalated += 1;
      if (record.effectiveSeverity === 'Critical' || record.effectiveSeverity === 'High') criticalOpen += 1;
    } else if (record.resolvedAt && new Date(record.resolvedAt) >= weekStart) {
      resolvedThisWeek += 1;
    }
  }

  const hostels = new Set(records.map((r) => r.hostel));
  const types = new Set(records.map((r) => r.incidentType));

  return {
    generatedAt: new Date().toISOString(),
    activeIncidents,
    unacknowledged,
    escalated,
    criticalOpen,
    resolvedThisWeek,
    facets: {
      hostels: [...hostels].sort(),
      types: [...types].sort() as IncidentUiType[],
    },
  };
}

export async function listIncidentsDeskRecords(
  prisma: PrismaClient,
  query: IncidentsDeskListQuery,
  scopeHostelNames?: string[],
): Promise<{ records: IncidentDeskRecord[]; total: number }> {
  const records = await loadIncidents(prisma, scopeHostelNames);
  const filtered = records.filter((r) => matchesFilters(r, query));
  const page = query.page ?? 1;
  const limit = query.limit ?? 120;
  const start = (page - 1) * limit;
  return { records: filtered.slice(start, start + limit), total: filtered.length };
}

async function getIncidentRowOrThrow(
  prisma: PrismaClient,
  incidentId: string,
  scopeHostelNames?: string[],
): Promise<IncidentRow> {
  const row = await prisma.emergencyIncident.findUnique({
    where: { id: incidentId },
    include: incidentInclude,
  });
  if (!row) throw new NotFoundError('Incident not found.');
  if (scopeHostelNames?.length && !hostelNameInScope(row.hostel.name, scopeHostelNames)) {
    throw new ForbiddenError('Incident is outside your hostel scope.');
  }
  return row;
}

export async function getIncidentDeskRecord(
  prisma: PrismaClient,
  incidentId: string,
  scopeHostelNames?: string[],
): Promise<{ record: IncidentDeskRecord; timeline: IncidentActionLogEntry[] }> {
  const row = await getIncidentRowOrThrow(prisma, incidentId, scopeHostelNames);
  const logs = await prisma.incidentActionLog.findMany({
    where: { incidentId },
    orderBy: { createdAt: 'asc' },
  });
  const actorIds = [...new Set([row.reportedBy, ...logs.map((l) => l.actionBy)])];
  const names = await loadUserNames(prisma, actorIds);
  const record = mapRow(row, names);
  const timeline: IncidentActionLogEntry[] = logs.map((log) => ({
    id: log.id,
    actionTaken: log.actionTaken,
    actorName: names.get(log.actionBy) ?? 'Responder',
    at: log.createdAt.toISOString(),
  }));
  return { record, timeline };
}

export async function acknowledgeIncident(
  prisma: PrismaClient,
  incidentId: string,
  actorId: string,
  scopeHostelNames?: string[],
): Promise<IncidentDeskRecord> {
  const row = await getIncidentRowOrThrow(prisma, incidentId, scopeHostelNames);
  if (row.status === 'RESOLVED') throw new BadRequestError('Incident is already resolved.');
  if (row.status !== 'REPORTED') throw new BadRequestError('Only reported incidents can be acknowledged.');
  await prisma.$transaction([
    prisma.emergencyIncident.update({
      where: { id: incidentId },
      data: { status: 'ACKNOWLEDGED' },
    }),
    prisma.incidentActionLog.create({
      data: { incidentId, actionBy: actorId, actionTaken: 'Warden acknowledged the incident on-site.' },
    }),
  ]);
  const names = await loadUserNames(prisma, [row.reportedBy]);
  const updated = await getIncidentRowOrThrow(prisma, incidentId, scopeHostelNames);
  return mapRow(updated, names);
}

export async function markIncidentInProgress(
  prisma: PrismaClient,
  incidentId: string,
  actorId: string,
  body: IncidentActionBody,
  scopeHostelNames?: string[],
): Promise<IncidentDeskRecord> {
  const row = await getIncidentRowOrThrow(prisma, incidentId, scopeHostelNames);
  if (row.status === 'RESOLVED') throw new BadRequestError('Incident is already resolved.');
  await prisma.$transaction([
    prisma.emergencyIncident.update({
      where: { id: incidentId },
      data: { status: 'IN_PROGRESS' },
    }),
    prisma.incidentActionLog.create({
      data: { incidentId, actionBy: actorId, actionTaken: body.actionTaken.trim() },
    }),
  ]);
  const names = await loadUserNames(prisma, [row.reportedBy]);
  const updated = await getIncidentRowOrThrow(prisma, incidentId, scopeHostelNames);
  return mapRow(updated, names);
}

export async function updateIncidentSeverity(
  prisma: PrismaClient,
  incidentId: string,
  actorId: string,
  body: PatchIncidentSeverityBody,
  scopeHostelNames?: string[],
): Promise<IncidentDeskRecord> {
  const row = await getIncidentRowOrThrow(prisma, incidentId, scopeHostelNames);
  if (row.status === 'RESOLVED') throw new BadRequestError('Cannot change severity on a resolved incident.');
  const dbSeverity = SEVERITY_TO_DB[body.officialSeverity];
  const note =
    body.notes?.trim() ||
    `Official severity set to ${body.officialSeverity} by warden.`;
  await prisma.$transaction([
    prisma.emergencyIncident.update({
      where: { id: incidentId },
      data: { officialSeverity: dbSeverity },
    }),
    prisma.incidentActionLog.create({
      data: { incidentId, actionBy: actorId, actionTaken: note },
    }),
  ]);
  const names = await loadUserNames(prisma, [row.reportedBy]);
  const updated = await getIncidentRowOrThrow(prisma, incidentId, scopeHostelNames);
  return mapRow(updated, names);
}

export async function resolveIncident(
  prisma: PrismaClient,
  incidentId: string,
  actorId: string,
  body: ResolveIncidentBody,
  scopeHostelNames?: string[],
): Promise<IncidentDeskRecord> {
  const row = await getIncidentRowOrThrow(prisma, incidentId, scopeHostelNames);
  if (row.status === 'RESOLVED') throw new BadRequestError('Incident is already resolved.');
  const now = new Date();
  await prisma.$transaction([
    prisma.emergencyIncident.update({
      where: { id: incidentId },
      data: { status: 'RESOLVED', resolvedAt: now },
    }),
    prisma.incidentActionLog.create({
      data: { incidentId, actionBy: actorId, actionTaken: body.actionTaken.trim() },
    }),
  ]);
  const names = await loadUserNames(prisma, [row.reportedBy]);
  const updated = await getIncidentRowOrThrow(prisma, incidentId, scopeHostelNames);
  return mapRow(updated, names);
}

export type StaffReportDesk = {
  generatedAt: string;
  hostelNames: string[];
  defaultHostelName: string | null;
  summary: {
    myOpen: number;
    myTotal: number;
    hostelActive: number;
  };
  records: IncidentDeskRecord[];
};

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

async function resolveStaffReportHostelId(
  prisma: PrismaClient,
  staffUserId: string,
  hostelIds: string[],
): Promise<string> {
  if (hostelIds.length === 0) {
    throw new ForbiddenError('You are not assigned to a hostel.');
  }
  const today = startOfUtcDay(new Date());
  const duty = await prisma.dutyAssignment.findFirst({
    where: {
      staffId: staffUserId,
      dutyDate: today,
      hostelId: { in: hostelIds },
    },
    select: { hostelId: true },
  });
  if (duty) return duty.hostelId;
  return hostelIds[0]!;
}

export async function getStaffReportDesk(
  prisma: PrismaClient,
  staffUserId: string,
  hostelIds: string[],
  hostelNames: string[],
): Promise<StaffReportDesk> {
  const scopedHostelWhere: Prisma.EmergencyIncidentWhereInput =
    hostelIds.length === 0
      ? { id: { equals: '00000000-0000-0000-0000-000000000000' } }
      : hostelIds.length === 1
        ? { hostelId: hostelIds[0] }
        : { hostelId: { in: hostelIds } };

  const [myRows, hostelActive] = await Promise.all([
    prisma.emergencyIncident.findMany({
      where: { ...scopedHostelWhere, reportedBy: staffUserId },
      include: incidentInclude,
      orderBy: { createdAt: 'desc' },
      take: 40,
    }),
    prisma.emergencyIncident.count({
      where: {
        ...scopedHostelWhere,
        status: { not: 'RESOLVED' },
      },
    }),
  ]);

  const names = await loadUserNames(prisma, [staffUserId]);
  const records = myRows.map((row) => mapRow(row, names));
  const myOpen = records.filter((r) => r.status !== 'Resolved').length;

  let defaultHostelName: string | null = hostelNames[0] ?? null;
  try {
    const defaultHostelId = await resolveStaffReportHostelId(prisma, staffUserId, hostelIds);
    const hostel = await prisma.hostel.findUnique({
      where: { id: defaultHostelId },
      select: { name: true },
    });
    defaultHostelName = hostel?.name ?? defaultHostelName;
  } catch {
    defaultHostelName = hostelNames[0] ?? null;
  }

  return {
    generatedAt: new Date().toISOString(),
    hostelNames,
    defaultHostelName,
    summary: {
      myOpen,
      myTotal: records.length,
      hostelActive,
    },
    records,
  };
}

export async function createStaffIncidentReport(
  prisma: PrismaClient,
  staffUserId: string,
  hostelIds: string[],
  body: StaffReportIncidentBody,
): Promise<IncidentDeskRecord> {
  const hostelId = await resolveStaffReportHostelId(prisma, staffUserId, hostelIds);
  const row = await prisma.emergencyIncident.create({
    data: {
      hostelId,
      reportedBy: staffUserId,
      incidentType: TYPE_TO_DB[body.incidentType],
      title: body.title.trim(),
      description: body.description.trim(),
      location: body.location.trim(),
      initialSeverity: SEVERITY_TO_DB[body.initialSeverity],
      status: 'REPORTED',
    },
    include: incidentInclude,
  });
  const names = await loadUserNames(prisma, [staffUserId]);
  const mapped = mapRow(row, names);
  await notifyIncidentReported(prisma, {
    hostelId,
    incidentId: row.id,
    title: mapped.title,
    severity: mapped.initialSeverity,
    reporterName: mapped.reportedByName,
  });
  return mapped;
}

export async function createStudentIncidentReport(
  prisma: PrismaClient,
  studentUserId: string,
  hostelId: string,
  body: StaffReportIncidentBody,
): Promise<IncidentDeskRecord> {
  const row = await prisma.emergencyIncident.create({
    data: {
      hostelId,
      reportedBy: studentUserId,
      incidentType: TYPE_TO_DB[body.incidentType],
      title: body.title.trim(),
      description: body.description.trim(),
      location: body.location.trim(),
      initialSeverity: SEVERITY_TO_DB[body.initialSeverity],
      status: 'REPORTED',
    },
    include: incidentInclude,
  });
  const names = await loadUserNames(prisma, [studentUserId]);
  const mapped = mapRow(row, names);
  await notifyIncidentReported(prisma, {
    hostelId,
    incidentId: row.id,
    title: mapped.title,
    severity: mapped.initialSeverity,
    reporterName: mapped.reportedByName,
  });
  return mapped;
}
