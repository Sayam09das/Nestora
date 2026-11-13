import type { PrismaClient } from '@nestora/database';
import type { RolesDeskListQuery } from '@nestora/validators';
import { MATRIX_MODULE_COUNT, ROLE_CATALOG, type RoleCatalogEntry } from './roles.catalog.js';

export type RoleDeskProfile = {
  id: string;
  code: string;
  title: string;
  description: string;
  tier: RoleCatalogEntry['tier'];
  frRef: string;
  activeUsers: number;
  scope: RoleCatalogEntry['scope'];
  lastAudit: string;
  risk: RoleCatalogEntry['risk'];
  sparkline: number[];
};

export type RolesDeskSummary = {
  generatedAt: string;
  roles: number;
  activeAccounts: number;
  hostelsScoped: number;
  customGrants: number;
  pendingReviews: number;
  matrixModules: number;
};

export type RoleAssignmentRow = {
  user: string;
  hostel: string;
  since: string;
};

function normalizeSparkline(values: number[]): number[] {
  const max = Math.max(...values, 1);
  return values.map((v) => Math.max(1, Math.round((v / max) * 12)));
}

function auditMatchesRole(actionName: string, actorRole: string, hints: string[]): boolean {
  const blob = `${actionName} ${actorRole}`.toUpperCase();
  return hints.some((h) => blob.includes(h.toUpperCase()));
}

async function loadRecentAudits(prisma: PrismaClient, since: Date) {
  return prisma.auditLog.findMany({
    where: { timestamp: { gte: since } },
    select: { actionName: true, actorRole: true, timestamp: true },
    orderBy: { timestamp: 'desc' },
    take: 800,
  });
}

function sparklineForRole(
  audits: Awaited<ReturnType<typeof loadRecentAudits>>,
  entry: RoleCatalogEntry,
): number[] {
  const buckets = Array.from({ length: 7 }, () => 0);
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  for (const row of audits) {
    if (!auditMatchesRole(row.actionName, row.actorRole, entry.auditHints)) continue;
    const diff = Math.floor((now - row.timestamp.getTime()) / dayMs);
    if (diff >= 0 && diff < 7) {
      const idx = 6 - diff;
      buckets[idx] = (buckets[idx] ?? 0) + 1;
    }
  }
  return normalizeSparkline(buckets);
}

function lastAuditForRole(audits: Awaited<ReturnType<typeof loadRecentAudits>>, entry: RoleCatalogEntry): string {
  const hit = audits.find((row) => auditMatchesRole(row.actionName, row.actorRole, entry.auditHints));
  return (hit?.timestamp ?? new Date()).toISOString();
}

function displayName(firstName: string | null, lastName: string | null): string {
  return `${firstName ?? ''} ${lastName ?? ''}`.trim() || 'User';
}

export async function getRolesDeskSummary(prisma: PrismaClient): Promise<RolesDeskSummary> {
  const [
    activeAccounts,
    hostelsScoped,
    customGrants,
    pendingReviews,
    roleCounts,
  ] = await Promise.all([
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.hostel.count({ where: { isActive: true } }),
    prisma.hostelAssignment.count(),
    prisma.user.count({
      where: {
        OR: [{ mustChangePassword: true }, { isVerified: false }],
        role: { in: ['UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF', 'SECURITY_GUARD', 'ACCOUNTANT'] },
      },
    }),
    prisma.user.groupBy({
      by: ['role'],
      where: { status: 'ACTIVE' },
      _count: { _all: true },
    }),
  ]);

  void roleCounts;

  return {
    generatedAt: new Date().toISOString(),
    roles: ROLE_CATALOG.length,
    activeAccounts,
    hostelsScoped,
    customGrants,
    pendingReviews,
    matrixModules: MATRIX_MODULE_COUNT,
  };
}

export async function listRolesDeskProfiles(
  prisma: PrismaClient,
  query: RolesDeskListQuery,
): Promise<RoleDeskProfile[]> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [audits, roleCounts] = await Promise.all([
    loadRecentAudits(prisma, weekAgo),
    prisma.user.groupBy({
      by: ['role'],
      where: { status: 'ACTIVE' },
      _count: { _all: true },
    }),
  ]);

  const countMap = new Map(roleCounts.map((r) => [r.role, r._count._all]));

  let rows = ROLE_CATALOG;
  const q = query.q?.trim().toLowerCase();
  if (query.tier) rows = rows.filter((r) => r.tier === query.tier);
  if (query.scope) rows = rows.filter((r) => r.scope === query.scope);
  if (query.risk) rows = rows.filter((r) => r.risk === query.risk);
  if (q) {
    rows = rows.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.frRef.toLowerCase().includes(q),
    );
  }

  return rows.map((entry) => ({
    id: entry.id,
    code: entry.code,
    title: entry.title,
    description: entry.description,
    tier: entry.tier,
    frRef: entry.frRef,
    activeUsers: countMap.get(entry.dbRole) ?? 0,
    scope: entry.scope,
    lastAudit: lastAuditForRole(audits, entry),
    risk: entry.risk,
    sparkline: sparklineForRole(audits, entry),
  }));
}

export async function getRoleDeskProfile(
  prisma: PrismaClient,
  roleId: string,
): Promise<{ profile: RoleDeskProfile; assignments: RoleAssignmentRow[] } | null> {
  const entry = ROLE_CATALOG.find((r) => r.id === roleId);
  if (!entry) return null;

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [audits, activeUsers, assignments] = await Promise.all([
    loadRecentAudits(prisma, weekAgo),
    prisma.user.count({ where: { role: entry.dbRole, status: 'ACTIVE' } }),
    loadAssignments(prisma, entry),
  ]);

  const profile: RoleDeskProfile = {
    id: entry.id,
    code: entry.code,
    title: entry.title,
    description: entry.description,
    tier: entry.tier,
    frRef: entry.frRef,
    activeUsers,
    scope: entry.scope,
    lastAudit: lastAuditForRole(audits, entry),
    risk: entry.risk,
    sparkline: sparklineForRole(audits, entry),
  };

  return { profile, assignments };
}

async function loadAssignments(prisma: PrismaClient, entry: RoleCatalogEntry): Promise<RoleAssignmentRow[]> {
  const take = 12;

  if (entry.dbRole === 'UNIVERSITY_ADMINISTRATOR') {
    const users = await prisma.user.findMany({
      where: { role: 'UNIVERSITY_ADMINISTRATOR', status: 'ACTIVE' },
      select: { firstName: true, lastName: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
      take,
    });
    return users.map((u) => ({
      user: displayName(u.firstName, u.lastName),
      hostel: 'University-wide',
      since: u.createdAt.toISOString().slice(0, 10),
    }));
  }

  if (entry.dbRole === 'HOSTEL_WARDEN') {
    const hostels = await prisma.hostel.findMany({
      where: { wardenInCharge: { not: null }, isActive: true },
      select: {
        name: true,
        createdAt: true,
        warden: { select: { firstName: true, lastName: true } },
      },
      take,
    });
    return hostels
      .filter((h) => h.warden)
      .map((h) => ({
        user: displayName(h.warden!.firstName, h.warden!.lastName),
        hostel: h.name,
        since: h.createdAt.toISOString().slice(0, 10),
      }));
  }

  if (entry.dbRole === 'HOSTEL_STAFF' || entry.dbRole === 'SECURITY_GUARD') {
    const rows = await prisma.hostelAssignment.findMany({
      where: { user: { role: entry.dbRole, status: 'ACTIVE' } },
      select: {
        assignedAt: true,
        hostel: { select: { name: true } },
        user: { select: { firstName: true, lastName: true } },
      },
      orderBy: { assignedAt: 'desc' },
      take,
    });
    return rows.map((r) => ({
      user: displayName(r.user.firstName, r.user.lastName),
      hostel: r.hostel.name,
      since: r.assignedAt.toISOString().slice(0, 10),
    }));
  }

  if (entry.dbRole === 'ACCOUNTANT') {
    const users = await prisma.user.findMany({
      where: { role: 'ACCOUNTANT', status: 'ACTIVE' },
      select: { firstName: true, lastName: true, createdAt: true },
      take,
    });
    return users.map((u) => ({
      user: displayName(u.firstName, u.lastName),
      hostel: 'University-wide',
      since: u.createdAt.toISOString().slice(0, 10),
    }));
  }

  return [];
}
