import type { Prisma, PrismaClient } from '@nestora/database';
import type { ReportsDeskListQuery } from '@nestora/validators';
import { REPORT_CATALOG, type ReportCatalogEntry } from './reports.catalog.js';

const OPEN_COMPLAINT_STATUSES = ['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'REOPENED'] as const;

export type ReportDeskTemplate = {
  id: string;
  code: string;
  title: string;
  description: string;
  category: ReportCatalogEntry['category'];
  frRef: string;
  format: ReportCatalogEntry['format'];
  refresh: string;
  lastRun: string;
  hostelScoped: boolean;
  sparkline: number[];
};

export type ReportsDeskSummary = {
  generatedAt: string;
  templates: number;
  scheduledJobs: number;
  exportsThisWeek: number;
  avgRunSeconds: number;
  dataFreshnessMin: number;
  facets: { hostels: string[]; categories: ReportCatalogEntry['category'][] };
};

export type ReportChartPoint = Record<string, string | number>;

export type ReportDeskPreview = {
  reportId: string;
  generatedAt: string;
  sparkline: number[];
  chart: {
    data: ReportChartPoint[];
    dataKey: string;
    xKey: string;
  } | null;
};

function money(value: Prisma.Decimal | number | null | undefined): number {
  if (value == null) return 0;
  return Math.round(Number(value));
}

function periodStart(period?: string): Date {
  const now = new Date();
  switch (period) {
    case 'Last 7 days':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'This term':
      return new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000);
    case 'Custom range':
    case 'Last 30 days':
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}

function normalizeSparkline(values: number[]): number[] {
  const max = Math.max(...values, 1);
  return values.map((v) => Math.max(1, Math.round((v / max) * 12)));
}

function hostelWhere(scopeHostelNames?: string[]): Prisma.HostelWhereInput | undefined {
  if (!scopeHostelNames?.length) return undefined;
  return { name: { in: scopeHostelNames } };
}

async function loadHostelNames(prisma: PrismaClient, scopeHostelNames?: string[]): Promise<string[]> {
  const rows = await prisma.hostel.findMany({
    where: hostelWhere(scopeHostelNames),
    select: { name: true },
    orderBy: { name: 'asc' },
  });
  return rows.map((r) => r.name);
}

function matchesHostelFilter(hostelFilter: string | undefined, hostelName: string): boolean {
  if (!hostelFilter || hostelFilter === 'All Hostels') return true;
  return hostelName === hostelFilter;
}

export async function getReportsDeskSummary(
  prisma: PrismaClient,
  scopeHostelNames?: string[],
  benchmarkMs?: number,
): Promise<ReportsDeskSummary> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const scheduledJobs = REPORT_CATALOG.filter((r) => r.refresh !== 'On demand').length;

  const [exportsThisWeek, hostels] = await Promise.all([
    prisma.auditLog.count({
      where: {
        timestamp: { gte: weekAgo },
        OR: [
          { actionName: { contains: 'EXPORT', mode: 'insensitive' } },
          { entityType: { contains: 'REPORT', mode: 'insensitive' } },
        ],
      },
    }),
    loadHostelNames(prisma, scopeHostelNames),
  ]);

  const categories = [...new Set(REPORT_CATALOG.map((r) => r.category))].sort() as ReportCatalogEntry['category'][];
  const avgRunSeconds = benchmarkMs != null ? Math.round((benchmarkMs / 1000) * 10) / 10 : 0.8;

  return {
    generatedAt: new Date().toISOString(),
    templates: REPORT_CATALOG.length,
    scheduledJobs,
    exportsThisWeek,
    avgRunSeconds: avgRunSeconds > 0 ? avgRunSeconds : 0.8,
    dataFreshnessMin: 0,
    facets: { hostels, categories },
  };
}

export async function listReportsDeskTemplates(
  prisma: PrismaClient,
  query: ReportsDeskListQuery,
  scopeHostelNames?: string[],
): Promise<ReportDeskTemplate[]> {
  const generatedAt = new Date().toISOString();
  const q = query.q?.trim().toLowerCase();

  let rows = REPORT_CATALOG;
  if (query.category) {
    rows = rows.filter((r) => r.category === query.category);
  }
  if (q) {
    rows = rows.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.frRef.toLowerCase().includes(q),
    );
  }

  const sparklines = await Promise.all(
    rows.map((r) => buildSparkline(prisma, r.id, scopeHostelNames, query.hostel, query.period)),
  );

  return rows.map((r, i) => ({
    id: r.id,
    code: r.code,
    title: r.title,
    description: r.description,
    category: r.category,
    frRef: r.frRef,
    format: r.format,
    refresh: r.refresh,
    lastRun: generatedAt,
    hostelScoped: r.hostelScoped,
    sparkline: sparklines[i] ?? [4, 5, 6, 7, 8, 9],
  }));
}

export async function getReportDeskTemplateById(
  prisma: PrismaClient,
  reportId: string,
  scopeHostelNames?: string[],
): Promise<ReportDeskTemplate | null> {
  const entry = REPORT_CATALOG.find((r) => r.id === reportId);
  if (!entry) return null;
  if (entry.hostelScoped && scopeHostelNames?.length && !scopeHostelNames.some(() => true)) {
    return null;
  }
  const generatedAt = new Date().toISOString();
  const sparkline = await buildSparkline(prisma, reportId, scopeHostelNames, undefined, 'Last 30 days');
  return {
    id: entry.id,
    code: entry.code,
    title: entry.title,
    description: entry.description,
    category: entry.category,
    frRef: entry.frRef,
    format: entry.format,
    refresh: entry.refresh,
    lastRun: generatedAt,
    hostelScoped: entry.hostelScoped,
    sparkline,
  };
}

export async function getReportDeskPreview(
  prisma: PrismaClient,
  reportId: string,
  scopeHostelNames?: string[],
  hostelFilter?: string,
  period?: string,
): Promise<ReportDeskPreview | null> {
  const entry = REPORT_CATALOG.find((r) => r.id === reportId);
  if (!entry) return null;

  const sparkline = await buildSparkline(prisma, reportId, scopeHostelNames, hostelFilter, period);
  const chart = await buildPreviewChart(prisma, reportId, scopeHostelNames, hostelFilter, period);

  return {
    reportId,
    generatedAt: new Date().toISOString(),
    sparkline,
    chart,
  };
}

async function buildSparkline(
  prisma: PrismaClient,
  reportId: string,
  scopeHostelNames?: string[],
  hostelFilter?: string,
  period?: string,
): Promise<number[]> {
  const since = periodStart(period);
  const buckets = Array.from({ length: 6 }, () => 0);
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const hostelScope = scopeHostelNames?.filter((n) => matchesHostelFilter(hostelFilter, n));
  const hostelIds = await resolveHostelIds(prisma, hostelScope);

  switch (reportId) {
    case 'rpt-fees': {
      const payments = await prisma.paymentRecord.findMany({
        where: {
          paymentDate: { gte: since },
          ...(hostelIds.length
            ? {
                student: {
                  allocationRecords: {
                    some: {
                      status: 'ACTIVE',
                      bed: { room: { floor: { block: { building: { hostelId: { in: hostelIds } } } } } },
                    },
                  },
                },
              }
            : {}),
        },
        select: { paymentDate: true, amount: true },
        take: 500,
      });
      for (const p of payments) {
        const diff = Math.floor((now - p.paymentDate.getTime()) / dayMs);
        if (diff >= 0 && diff < 6) {
          const idx = 5 - diff;
          buckets[idx] = (buckets[idx] ?? 0) + money(p.amount);
        }
      }
      break;
    }
    case 'rpt-complaints': {
      const tickets = await prisma.complaintTicket.findMany({
        where: {
          createdAt: { gte: since },
          status: { in: [...OPEN_COMPLAINT_STATUSES] },
          ...(hostelIds.length ? { hostelId: { in: hostelIds } } : {}),
        },
        select: { createdAt: true },
        take: 400,
      });
      for (const t of tickets) {
        const diff = Math.floor((now - t.createdAt.getTime()) / dayMs);
        if (diff >= 0 && diff < 6) {
          const idx = 5 - diff;
          buckets[idx] = (buckets[idx] ?? 0) + 1;
        }
      }
      break;
    }
    case 'rpt-attendance': {
      const records = await prisma.attendanceRecord.findMany({
        where: {
          attendanceDate: { gte: since },
          ...(hostelIds.length ? { hostelId: { in: hostelIds } } : {}),
        },
        select: { attendanceDate: true, status: true },
        take: 800,
      });
      for (const r of records) {
        const diff = Math.floor((now - r.attendanceDate.getTime()) / dayMs);
        if (diff >= 0 && diff < 6) {
          const idx = 5 - diff;
          buckets[idx] = (buckets[idx] ?? 0) + (r.status === 'PRESENT' ? 1 : 0);
        }
      }
      break;
    }
    default:
      return [6, 7, 8, 9, 10, 11];
  }

  return normalizeSparkline(buckets);
}

async function resolveHostelIds(prisma: PrismaClient, scopeHostelNames?: string[]): Promise<string[]> {
  if (!scopeHostelNames?.length) {
    if (scopeHostelNames && scopeHostelNames.length === 0) return [];
    const all = await prisma.hostel.findMany({ select: { id: true } });
    return all.map((h) => h.id);
  }
  const rows = await prisma.hostel.findMany({
    where: { name: { in: scopeHostelNames } },
    select: { id: true },
  });
  return rows.map((r) => r.id);
}

async function buildPreviewChart(
  prisma: PrismaClient,
  reportId: string,
  scopeHostelNames?: string[],
  hostelFilter?: string,
  period?: string,
): Promise<ReportDeskPreview['chart']> {
  const since = periodStart(period);
  const scopedNames =
    scopeHostelNames?.filter((n) => matchesHostelFilter(hostelFilter, n)) ??
    (hostelFilter && hostelFilter !== 'All Hostels' ? [hostelFilter] : undefined);

  switch (reportId) {
    case 'rpt-fees':
      return {
        data: await buildFeeChart(prisma, scopedNames),
        dataKey: 'collected',
        xKey: 'month',
      };
    case 'rpt-occupancy':
      return {
        data: await buildOccupancyChart(prisma, scopedNames, hostelFilter),
        dataKey: 'occupied',
        xKey: 'hostel',
      };
    case 'rpt-attendance':
      return {
        data: await buildAttendanceChart(prisma, scopedNames, since),
        dataKey: 'rate',
        xKey: 'week',
      };
    case 'rpt-complaints':
      return {
        data: await buildComplaintsChart(prisma, scopedNames, since),
        dataKey: 'open',
        xKey: 'category',
      };
    default:
      return null;
  }
}

async function buildFeeChart(prisma: PrismaClient, scopeHostelNames?: string[]): Promise<ReportChartPoint[]> {
  const now = new Date();
  const points: ReportChartPoint[] = [];
  const hostelIds = await resolveHostelIds(prisma, scopeHostelNames);

  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
    const monthLabel = new Intl.DateTimeFormat('en-IN', { month: 'short' }).format(d);
    const agg = await prisma.paymentRecord.aggregate({
      where: {
        paymentDate: { gte: d, lte: end },
        ...(hostelIds.length
          ? {
              student: {
                allocationRecords: {
                  some: {
                    status: 'ACTIVE',
                    bed: { room: { floor: { block: { building: { hostelId: { in: hostelIds } } } } } },
                  },
                },
              },
            }
          : {}),
      },
      _sum: { amount: true },
    });
    points.push({ month: monthLabel, collected: money(agg._sum.amount) });
  }
  return points;
}

async function buildOccupancyChart(
  prisma: PrismaClient,
  scopeHostelNames?: string[],
  hostelFilter?: string,
): Promise<ReportChartPoint[]> {
  const hostels = await prisma.hostel.findMany({
    where: hostelWhere(scopeHostelNames),
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  const points: ReportChartPoint[] = [];
  for (const h of hostels) {
    if (!matchesHostelFilter(hostelFilter, h.name)) continue;
    const [beds, occupied] = await Promise.all([
      prisma.bed.count({
        where: { room: { floor: { block: { building: { hostelId: h.id } } } } },
      }),
      prisma.allocationRecord.count({
        where: {
          status: 'ACTIVE',
          bed: { room: { floor: { block: { building: { hostelId: h.id } } } } },
        },
      }),
    ]);
    const pct = beds > 0 ? Math.round((occupied / beds) * 100) : 0;
    points.push({ hostel: h.name, occupied: pct });
  }
  return points.length ? points : [{ hostel: '—', occupied: 0 }];
}

async function buildAttendanceChart(
  prisma: PrismaClient,
  scopeHostelNames?: string[],
  since?: Date,
): Promise<ReportChartPoint[]> {
  const hostelIds = await resolveHostelIds(prisma, scopeHostelNames);
  const points: ReportChartPoint[] = [];
  const now = new Date();

  for (let w = 3; w >= 0; w--) {
    const end = new Date(now.getTime() - w * 7 * 24 * 60 * 60 * 1000);
    const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
    const floor = since && start < since ? since : start;
    const grouped = await prisma.attendanceRecord.groupBy({
      by: ['status'],
      where: {
        attendanceDate: { gte: floor, lte: end },
        ...(hostelIds.length ? { hostelId: { in: hostelIds } } : {}),
      },
      _count: { _all: true },
    });
    const total = grouped.reduce((s, g) => s + g._count._all, 0);
    const present = grouped.find((g) => g.status === 'PRESENT')?._count._all ?? 0;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    points.push({ week: `W${4 - w}`, rate });
  }
  return points;
}

async function buildComplaintsChart(
  prisma: PrismaClient,
  scopeHostelNames?: string[],
  since?: Date,
): Promise<ReportChartPoint[]> {
  const hostelIds = await resolveHostelIds(prisma, scopeHostelNames);
  const grouped = await prisma.complaintTicket.groupBy({
    by: ['category'],
    where: {
      status: { in: [...OPEN_COMPLAINT_STATUSES] },
      createdAt: since ? { gte: since } : undefined,
      ...(hostelIds.length ? { hostelId: { in: hostelIds } } : {}),
    },
    _count: { _all: true },
  });

  return grouped
    .sort((a, b) => b._count._all - a._count._all)
    .slice(0, 8)
    .map((g) => ({
    category: g.category.replace(/_/g, ' '),
    open: g._count._all,
  }));
}

export function assertReportInScope(reportId: string, scopeHostelNames?: string[]): boolean {
  const entry = REPORT_CATALOG.find((r) => r.id === reportId);
  if (!entry) return false;
  if (!entry.hostelScoped || !scopeHostelNames) return true;
  return scopeHostelNames.length > 0;
}
