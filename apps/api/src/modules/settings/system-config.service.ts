import type { PrismaClient } from '@nestora/database';
import {
  ABSENCE_CONSECUTIVE_THRESHOLD,
  COMPLAINT_RESOLVED_AUTO_CLOSE_HOURS,
  EXTENDED_LEAVE_ADMIN_DAYS,
  LATE_FEE_FLAT_AMOUNT,
  LATE_FEE_GRACE_DAYS,
} from '../../config/policy-defaults.js';

export const CONFIG_KEYS = {
  absence_threshold: 'absence_threshold',
  auto_close_hours: 'auto_close_hours',
  extended_leave_admin_days: 'extended_leave_admin_days',
  late_fee_grace_days: 'late_fee_grace_days',
  late_fee_flat_amount: 'late_fee_flat_amount',
  auto_late_enabled: 'auto_late_enabled',
  roll_cutoff: 'roll_cutoff',
} as const;

type ConfigKey = (typeof CONFIG_KEYS)[keyof typeof CONFIG_KEYS];

const DEFAULTS: Record<ConfigKey, number | boolean> = {
  absence_threshold: ABSENCE_CONSECUTIVE_THRESHOLD,
  auto_close_hours: COMPLAINT_RESOLVED_AUTO_CLOSE_HOURS,
  extended_leave_admin_days: EXTENDED_LEAVE_ADMIN_DAYS,
  late_fee_grace_days: LATE_FEE_GRACE_DAYS,
  late_fee_flat_amount: LATE_FEE_FLAT_AMOUNT,
  auto_late_enabled: true,
  roll_cutoff: 45,
};

export const WARDEN_PATCHABLE_PANEL_FIELDS = new Set([
  'absence_threshold',
  'extended_leave_admin_days',
  'auto_close_hours',
  'roll_cutoff',
  'auto_late',
]);

const PANEL_FIELD_TO_CONFIG: Record<string, ConfigKey> = {
  absence_threshold: CONFIG_KEYS.absence_threshold,
  auto_close_hours: CONFIG_KEYS.auto_close_hours,
  extended_leave_admin_days: CONFIG_KEYS.extended_leave_admin_days,
  grace_days: CONFIG_KEYS.late_fee_grace_days,
  late_fee_flat_amount: CONFIG_KEYS.late_fee_flat_amount,
  auto_late: CONFIG_KEYS.auto_late_enabled,
  roll_cutoff: CONFIG_KEYS.roll_cutoff,
};

function serializeValue(value: string | number | boolean): string {
  return JSON.stringify(value);
}

function parseValue(raw: string): string | number | boolean {
  try {
    return JSON.parse(raw) as string | number | boolean;
  } catch {
    return raw;
  }
}

export async function getConfigValue<T extends string | number | boolean>(
  prisma: PrismaClient,
  key: ConfigKey,
): Promise<T> {
  const row = await prisma.systemConfiguration.findUnique({ where: { configKey: key } });
  if (!row) return DEFAULTS[key] as T;
  return parseValue(row.valueJson) as T;
}

export async function getConfigNumber(prisma: PrismaClient, key: ConfigKey): Promise<number> {
  const value = await getConfigValue<number | string>(prisma, key);
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : (DEFAULTS[key] as number);
}

export async function getConfigBoolean(prisma: PrismaClient, key: ConfigKey): Promise<boolean> {
  const value = await getConfigValue<boolean | string>(prisma, key);
  if (typeof value === 'boolean') return value;
  return value === 'true' || value === '1';
}

export async function loadConfigOverrides(
  prisma: PrismaClient,
): Promise<Record<string, string | number | boolean>> {
  const rows = await prisma.systemConfiguration.findMany();
  const out: Record<string, string | number | boolean> = { ...DEFAULTS };
  for (const row of rows) {
    out[row.configKey] = parseValue(row.valueJson);
  }
  return out;
}

export async function patchPanelConfigFields(
  prisma: PrismaClient,
  actorUserId: string,
  fields: Record<string, string | number | boolean>,
): Promise<void> {
  for (const [fieldKey, value] of Object.entries(fields)) {
    const configKey = PANEL_FIELD_TO_CONFIG[fieldKey];
    if (!configKey) continue;
    await prisma.systemConfiguration.upsert({
      where: { configKey },
      create: {
        configKey,
        valueJson: serializeValue(value),
        updatedBy: actorUserId,
      },
      update: {
        valueJson: serializeValue(value),
        updatedBy: actorUserId,
      },
    });
  }
}