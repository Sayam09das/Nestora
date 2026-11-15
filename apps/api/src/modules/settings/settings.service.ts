import type { PrismaClient } from '@nestora/database';
import type { SettingsDeskListQuery } from '@nestora/validators';
import type { Env } from '../../config/env.js';
import { BadRequestError } from '../../common/errors/index.js';
import { CRITICAL_LOCKED_CONTROLS, SETTINGS_CATALOG, type SettingsCatalogEntry } from './settings.catalog.js';
import { PANEL_FIELD_TEMPLATES, type SettingFieldTemplate } from './settings.fields.js';
import { patchSettingsPanelBodySchema } from '@nestora/validators';
import type { z } from 'zod';
import {
  loadConfigOverrides,
  patchPanelConfigFields,
  WARDEN_PATCHABLE_PANEL_FIELDS,
} from './system-config.service.js';

export type SettingsPanelStatus = 'Synced' | 'Draft' | 'Pending approval';

export type SettingsDeskPanel = {
  id: string;
  code: string;
  title: string;
  description: string;
  category: SettingsCatalogEntry['category'];
  frRef: string;
  lastModified: string;
  status: SettingsPanelStatus;
  risk: 'low' | 'medium' | 'high';
  controlsCount: number;
  sparkline: number[];
};

export type SettingsDeskSummary = {
  generatedAt: string;
  panels: number;
  pendingDrafts: number;
  criticalLocks: number;
  lastPublishHours: number;
  environment: string;
  policyTier: string;
  facets: {
    categories: SettingsCatalogEntry['category'][];
    scopes: Array<'University-wide' | 'Hostel overrides'>;
  };
};

export type SettingFieldDto = {
  key: string;
  label: string;
  type: SettingFieldTemplate['type'];
  value: string | number | boolean;
  help?: string;
  options?: string[];
  wardenEditable?: boolean;
};

export type SettingsChangeLogEntry = {
  when: string;
  actor: string;
  change: string;
};

export type SettingsPanelDetail = {
  panel: SettingsDeskPanel;
  fields: SettingFieldDto[];
  changeLog: SettingsChangeLogEntry[];
};

const OPEN_COMPLAINT = ['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'REOPENED'] as const;
const PENDING_FEE_STATUSES = ['PENDING', 'PENDING_ADMIN_APPROVAL', 'SUBMITTED'] as const;
const OPEN_INCIDENT_STATUSES = ['REPORTED', 'ACKNOWLEDGED', 'IN_PROGRESS'] as const;
const CONFIG_PUBLISH_ACTIONS = [
  'UNIVERSITY_UPDATED',
  'HOSTEL_CREATED',
  'HOSTEL_UPDATED',
  'HOSTEL_DELETED',
  'MFA_ENABLED',
  'NOTICE_PUBLISHED',
] as const;

function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function academicSessionLabel(now = new Date()): string {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const startYear = m >= 6 ? y : y - 1;
  const endShort = (startYear + 1) % 100;
  return `${startYear}–${String(endShort).padStart(2, '0')}`;
}

function auditMatchesPanel(actionName: string, entityType: string, hints: string[]): boolean {
  const blob = `${actionName} ${entityType}`.toUpperCase();
  return hints.some((h) => blob.includes(h.toUpperCase()));
}

function normalizeSparkline(values: number[]): number[] {
  const max = Math.max(...values, 1);
  return values.map((v) => Math.max(1, Math.round((v / max) * 12)));
}

async function loadRecentAudits(prisma: PrismaClient, since: Date) {
  return prisma.auditLog.findMany({
    where: { timestamp: { gte: since } },
    select: { actionName: true, entityType: true, timestamp: true, actorRole: true },
    orderBy: { timestamp: 'desc' },
    take: 600,
  });
}

function sparklineForPanel(
  audits: Awaited<ReturnType<typeof loadRecentAudits>>,
  entry: SettingsCatalogEntry,
): number[] {
  const buckets = Array.from({ length: 7 }, () => 0);
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  for (const row of audits) {
    if (!auditMatchesPanel(row.actionName, row.entityType, entry.auditHints)) continue;
    const diff = Math.floor((now - row.timestamp.getTime()) / dayMs);
    if (diff >= 0 && diff < 7) {
      const idx = 6 - diff;
      buckets[idx] = (buckets[idx] ?? 0) + 1;
    }
  }
  return normalizeSparkline(buckets);
}

function lastModifiedForPanel(audits: Awaited<ReturnType<typeof loadRecentAudits>>, entry: SettingsCatalogEntry): string {
  const hit = audits.find((row) => auditMatchesPanel(row.actionName, row.entityType, entry.auditHints));
  return (hit?.timestamp ?? new Date()).toISOString();
}

async function derivePanelStatus(prisma: PrismaClient, panelId: string): Promise<SettingsPanelStatus> {
  switch (panelId) {
    case 'cfg-attendance': {
      const pending = await prisma.attendanceDiscrepancy.count({ where: { status: 'PENDING' } });
      return pending > 0 ? 'Draft' : 'Synced';
    }
    case 'cfg-fees': {
      const pending = await prisma.feeAdjustment.count({
        where: { status: { in: [...PENDING_FEE_STATUSES] } },
      });
      return pending > 0 ? 'Draft' : 'Synced';
    }
    case 'cfg-incidents': {
      const open = await prisma.emergencyIncident.count({
        where: { status: { in: [...OPEN_INCIDENT_STATUSES] }, isEscalated: true },
      });
      if (open > 0) return 'Pending approval';
      const unacked = await prisma.emergencyIncident.count({
        where: { status: 'REPORTED' },
      });
      return unacked > 0 ? 'Draft' : 'Synced';
    }
    case 'cfg-notifications': {
      const scheduled = await prisma.notice.count({
        where: { publishedAt: { gt: new Date() } },
      });
      return scheduled > 0 ? 'Pending approval' : 'Synced';
    }
    default:
      return 'Synced';
  }
}

export async function getSettingsDeskSummary(
  prisma: PrismaClient,
  env: Env,
  benchmarkMs?: number,
): Promise<SettingsDeskSummary> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const lastPublish = await prisma.auditLog.findFirst({
    where: { actionName: { in: [...CONFIG_PUBLISH_ACTIONS] } },
    orderBy: { timestamp: 'desc' },
    select: { timestamp: true },
  });

  const lastPublishHours = lastPublish
    ? Math.max(0, Math.floor((Date.now() - lastPublish.timestamp.getTime()) / (60 * 60 * 1000)))
    : 0;

  const statuses = await Promise.all(SETTINGS_CATALOG.map((p) => derivePanelStatus(prisma, p.id)));
  const pendingDrafts = statuses.filter((s) => s === 'Draft' || s === 'Pending approval').length;

  void benchmarkMs;

  return {
    generatedAt: new Date().toISOString(),
    panels: SETTINGS_CATALOG.length,
    pendingDrafts,
    criticalLocks: CRITICAL_LOCKED_CONTROLS,
    lastPublishHours,
    environment: env.NODE_ENV === 'production' ? 'Production' : 'Development',
    policyTier: 'Tier 1',
    facets: {
      categories: [...new Set(SETTINGS_CATALOG.map((p) => p.category))],
      scopes: ['University-wide', 'Hostel overrides'],
    },
  };
}

export async function listSettingsDeskPanels(
  prisma: PrismaClient,
  query: SettingsDeskListQuery,
): Promise<SettingsDeskPanel[]> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const audits = await loadRecentAudits(prisma, weekAgo);

  let rows = SETTINGS_CATALOG;
  const q = query.q?.trim().toLowerCase();
  if (query.category) {
    rows = rows.filter((r) => r.category === query.category);
  }
  if (query.scope) {
    rows = rows.filter((r) => r.scope === query.scope);
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

  const statuses = await Promise.all(rows.map((r) => derivePanelStatus(prisma, r.id)));

  let panels = rows.map((entry, i) => ({
    id: entry.id,
    code: entry.code,
    title: entry.title,
    description: entry.description,
    category: entry.category,
    frRef: entry.frRef,
    lastModified: lastModifiedForPanel(audits, entry),
    status: statuses[i] ?? 'Synced',
    risk: entry.risk,
    controlsCount: entry.controlsCount,
    sparkline: sparklineForPanel(audits, entry),
  }));

  if (query.status) {
    panels = panels.filter((p) => p.status === query.status);
  }

  return panels;
}

async function liveFieldValues(prisma: PrismaClient, panelId: string, env: Env): Promise<Record<string, string | number | boolean>> {
  const today = startOfTodayUtc();

  switch (panelId) {
    case 'cfg-general': {
      const university = await prisma.university.findFirst({ select: { name: true, createdAt: true } });
      return {
        univ_name: university?.name ?? 'Nestora State University',
        session: academicSessionLabel(),
        timezone: 'Asia/Kolkata',
        locale: 'en-IN',
      };
    }
    case 'cfg-hostel-ops': {
      const [activeHostels, rules, wardens] = await Promise.all([
        prisma.hostel.count({ where: { isActive: true } }),
        prisma.hostelRule.count(),
        prisma.hostel.count({ where: { wardenInCharge: { not: null } } }),
      ]);
      return { active_hostels: activeHostels, hostel_rules: rules, warden_assignments: wardens };
    }
    case 'cfg-attendance': {
      const [openDiscrepancies, recordsToday] = await Promise.all([
        prisma.attendanceDiscrepancy.count({ where: { status: 'PENDING' } }),
        prisma.attendanceRecord.count({ where: { attendanceDate: { gte: today } } }),
      ]);
      const cfg = await loadConfigOverrides(prisma);
      return {
        roll_cutoff: cfg.roll_cutoff ?? 45,
        absence_threshold: cfg.absence_threshold ?? 3,
        extended_leave_admin_days: cfg.extended_leave_admin_days ?? 7,
        open_discrepancies: openDiscrepancies,
        records_today: recordsToday,
        auto_escalate: openDiscrepancies > 0,
      };
    }
    case 'cfg-notifications': {
      const now = new Date();
      const [live, scheduled] = await Promise.all([
        prisma.notice.count({
          where: {
            publishedAt: { lte: now },
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
          },
        }),
        prisma.notice.count({ where: { publishedAt: { gt: now } } }),
      ]);
      return {
        live_notices: live,
        scheduled_notices: scheduled,
        emergency_lock: true,
        disciplinary_lock: true,
      };
    }
    case 'cfg-incidents': {
      const [open, escalated] = await Promise.all([
        prisma.emergencyIncident.count({ where: { status: { in: [...OPEN_INCIDENT_STATUSES] } } }),
        prisma.emergencyIncident.count({ where: { isEscalated: true, resolvedAt: null } }),
      ]);
      return {
        open_incidents: open,
        escalated: escalated,
        guardian_auto: escalated > 0,
      };
    }
    case 'cfg-visitors': {
      const [todayVisits, active] = await Promise.all([
        prisma.visitorRecord.count({ where: { checkInTime: { gte: today } } }),
        prisma.visitorRecord.count({ where: { checkOutTime: null } }),
      ]);
      return { visitors_today: todayVisits, open_visits: active };
    }
    case 'cfg-fees': {
      const [pending, schedules] = await Promise.all([
        prisma.feeAdjustment.count({ where: { status: { in: [...PENDING_FEE_STATUSES] } } }),
        prisma.feeSchedule.count({ where: { status: { in: ['ACTIVE', 'APPROVED'] } } }),
      ]);
      const cfg = await loadConfigOverrides(prisma);
      return {
        pending_adjustments: pending,
        active_schedules: schedules,
        auto_late: cfg.auto_late_enabled ?? pending === 0,
        grace_days: cfg.late_fee_grace_days ?? 7,
        late_fee_flat_amount: cfg.late_fee_flat_amount ?? 500,
      };
    }
    case 'cfg-security': {
      const [mfa, admins] = await Promise.all([
        prisma.user.count({ where: { mfaEnabled: true } }),
        prisma.user.count({ where: { role: 'UNIVERSITY_ADMINISTRATOR' } }),
      ]);
      return {
        mfa_enabled: mfa,
        admin_users: admins,
        session_idle_min: env.SESSION_IDLE_TIMEOUT_MINUTES,
      };
    }
    case 'cfg-maintenance': {
      const [open, assigned] = await Promise.all([
        prisma.complaintTicket.count({ where: { status: { in: [...OPEN_COMPLAINT] } } }),
        prisma.complaintTicket.count({ where: { status: 'IN_PROGRESS' } }),
      ]);
      const cfg = await loadConfigOverrides(prisma);
      return {
        open_tickets: open,
        assigned_tickets: assigned,
        auto_close_hours: cfg.auto_close_hours ?? 72,
      };
    }
    case 'cfg-roles': {
      const [staff, warden] = await Promise.all([
        prisma.user.count({ where: { role: 'HOSTEL_STAFF' } }),
        prisma.user.count({ where: { role: 'HOSTEL_WARDEN' } }),
      ]);
      return { staff_accounts: staff, warden_accounts: warden };
    }
    default:
      return {};
  }
}

function buildFields(panelId: string, live: Record<string, string | number | boolean>): SettingFieldDto[] {
  const templates = PANEL_FIELD_TEMPLATES[panelId] ?? [];
  return templates.map((t) => ({
    key: t.key,
    label: t.label,
    type: t.type,
    value: live[t.key] ?? t.defaultValue,
    help: t.help,
    options: t.options,
    wardenEditable: WARDEN_PATCHABLE_PANEL_FIELDS.has(t.key),
  }));
}

async function buildChangeLog(prisma: PrismaClient, entry: SettingsCatalogEntry): Promise<SettingsChangeLogEntry[]> {
  const rows = await prisma.auditLog.findMany({
    where: {
      OR: entry.auditHints.map((hint) => ({
        actionName: { contains: hint, mode: 'insensitive' as const },
      })),
    },
    orderBy: { timestamp: 'desc' },
    take: 6,
    select: { timestamp: true, actionName: true, actorRole: true, entityType: true },
  });

  return rows.map((row) => ({
    when: row.timestamp.toISOString(),
    actor: `${row.actorRole.replaceAll('_', ' ').toLowerCase()}`.replace(/^\w/, (c) => c.toUpperCase()),
    change: `${row.actionName.replaceAll('_', ' ').toLowerCase()} · ${row.entityType}`,
  }));
}

export async function getSettingsPanelDetail(
  prisma: PrismaClient,
  panelId: string,
  env: Env,
): Promise<SettingsPanelDetail | null> {
  const entry = SETTINGS_CATALOG.find((p) => p.id === panelId);
  if (!entry) return null;

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const audits = await loadRecentAudits(prisma, weekAgo);
  const status = await derivePanelStatus(prisma, panelId);
  const live = await liveFieldValues(prisma, panelId, env);

  const panel: SettingsDeskPanel = {
    id: entry.id,
    code: entry.code,
    title: entry.title,
    description: entry.description,
    category: entry.category,
    frRef: entry.frRef,
    lastModified: lastModifiedForPanel(audits, entry),
    status,
    risk: entry.risk,
    controlsCount: entry.controlsCount,
    sparkline: sparklineForPanel(audits, entry),
  };

  const [fields, changeLog] = await Promise.all([
    Promise.resolve(buildFields(panelId, live)),
    buildChangeLog(prisma, entry),
  ]);

  return { panel, fields, changeLog };
}

type PatchSettingsPanelBody = z.infer<typeof patchSettingsPanelBodySchema>;

export async function patchSettingsPanel(
  prisma: PrismaClient,
  panelId: string,
  env: Env,
  actorUserId: string,
  body: PatchSettingsPanelBody,
): Promise<SettingsPanelDetail | null> {
  const entry = SETTINGS_CATALOG.find((p) => p.id === panelId);
  if (!entry) return null;

  await patchPanelConfigFields(prisma, actorUserId, body.fields);

  await prisma.auditLog.create({
    data: {
      actorUserId,
      actorRole: 'UNIVERSITY_ADMINISTRATOR',
      actionName: 'SETTINGS_PANEL_PATCHED',
      entityType: 'SETTINGS_PANEL',
      entityId: panelId,
      newState: body.fields as object,
    },
  });

  return getSettingsPanelDetail(prisma, panelId, env);
}

export async function patchWardenSettingsPanel(
  prisma: PrismaClient,
  panelId: string,
  env: Env,
  actorUserId: string,
  body: PatchSettingsPanelBody,
): Promise<SettingsPanelDetail | null> {
  const entry = SETTINGS_CATALOG.find((p) => p.id === panelId);
  if (!entry) return null;

  const filtered: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(body.fields)) {
    if (WARDEN_PATCHABLE_PANEL_FIELDS.has(key)) {
      filtered[key] = value;
    }
  }
  if (Object.keys(filtered).length === 0) {
    throw new BadRequestError('No hostel-operational fields were provided.');
  }

  await patchPanelConfigFields(prisma, actorUserId, filtered);

  await prisma.auditLog.create({
    data: {
      actorUserId,
      actorRole: 'HOSTEL_WARDEN',
      actionName: 'SETTINGS_WARDEN_PANEL_PATCHED',
      entityType: 'SETTINGS_PANEL',
      entityId: panelId,
      newState: filtered as object,
    },
  });

  return getSettingsPanelDetail(prisma, panelId, env);
}
