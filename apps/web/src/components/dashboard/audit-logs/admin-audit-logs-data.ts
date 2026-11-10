import type { LucideIcon } from 'lucide-react';
import { BadgeIndianRupee, BedDouble, KeyRound, Siren, UserCog, Wrench } from 'lucide-react';

import type { AuditLogRow } from '@/lib/api/audit';

export const AUDIT_STATS = {
  entries24h: 186,
  immutable: true,
  sensitiveViews: 7,
  exportsWeek: 11,
  retentionYears: 7,
} as const;

export type AuditCategory = 'Account' | 'Housing' | 'Finance' | 'Safety' | 'Operations';

export const AUDIT_CATEGORY_FILTERS = ['All categories', 'Account', 'Housing', 'Finance', 'Safety', 'Operations'] as const;

export const AUDIT_SEVERITY_FILTERS = ['All severity', 'Info', 'Warning', 'Critical'] as const;

export const CATEGORY_META: Record<AuditCategory, { icon: LucideIcon; accent: string }> = {
  Account: { icon: UserCog, accent: '#7c3aed' },
  Housing: { icon: BedDouble, accent: 'var(--nestora-forest)' },
  Finance: { icon: BadgeIndianRupee, accent: 'var(--nestora-gold)' },
  Safety: { icon: Siren, accent: '#dc2626' },
  Operations: { icon: Wrench, accent: '#0284c7' },
};

export function categorizeAction(actionName: string): AuditCategory {
  const u = actionName.toUpperCase();
  if (u.includes('ROLE') || u.includes('USER') || u.includes('LOGIN') || u.includes('ACCOUNT')) return 'Account';
  if (u.includes('FEE') || u.includes('PAYMENT') || u.includes('LEDGER')) return 'Finance';
  if (u.includes('BED') || u.includes('ALLOC') || u.includes('ROOM') || u.includes('ADMISSION')) return 'Housing';
  if (u.includes('EMERGENCY') || u.includes('GUARDIAN') || u.includes('CONTACT')) return 'Safety';
  return 'Operations';
}

export type AuditSeverity = 'Info' | 'Warning' | 'Critical';

export function severityFor(actionName: string): AuditSeverity {
  const u = actionName.toUpperCase();
  if (u.includes('EMERGENCY') || u.includes('DEACTIVAT') || u.includes('GUARDIAN')) return 'Critical';
  if (u.includes('REJECT') || u.includes('WAIVE') || u.includes('OVERRIDE')) return 'Warning';
  return 'Info';
}

export const SAMPLE_AUDIT_LOGS: AuditLogRow[] = [
  {
    id: 'aud-001',
    actorUserId: 'usr-admin-1',
    actorRole: 'University Administrator',
    actionName: 'ROLE_ASSIGNMENT_CHANGED',
    entityType: 'UserAccount',
    entityId: 'usr-warden-12',
    previousState: { role: 'Hostel Staff', hostelId: null },
    newState: { role: 'Hostel Warden', hostelId: 'hostel-boys-a' },
    ipAddress: '103.21.44.8',
    timestamp: '2025-11-10T08:42:00.000Z',
  },
  {
    id: 'aud-002',
    actorUserId: 'usr-admin-1',
    actorRole: 'University Administrator',
    actionName: 'BED_ALLOCATION_CREATED',
    entityType: 'BedAllocation',
    entityId: 'bed-204-1',
    previousState: { status: 'Available', studentId: null },
    newState: { status: 'Occupied', studentId: 'stu-8821' },
    ipAddress: '103.21.44.8',
    timestamp: '2025-11-10T07:55:00.000Z',
  },
  {
    id: 'aud-003',
    actorUserId: 'usr-acct-2',
    actorRole: 'Accountant',
    actionName: 'FEE_ADJUSTMENT_RECORDED',
    entityType: 'FeeLedger',
    entityId: 'fee-stu-8821-q2',
    previousState: { outstanding: 12500 },
    newState: { outstanding: 11200, waiver: 1300 },
    ipAddress: '49.36.102.17',
    timestamp: '2025-11-09T18:10:00.000Z',
  },
  {
    id: 'aud-004',
    actorUserId: 'usr-warden-12',
    actorRole: 'Hostel Warden',
    actionName: 'LEAVE_REQUEST_APPROVED',
    entityType: 'LeaveRequest',
    entityId: 'lv-4410',
    previousState: { status: 'Pending' },
    newState: { status: 'Approved', gatePass: 'GP-8841' },
    ipAddress: '117.203.88.2',
    timestamp: '2025-11-09T15:22:00.000Z',
  },
  {
    id: 'aud-005',
    actorUserId: 'usr-admin-1',
    actorRole: 'University Administrator',
    actionName: 'USER_ACCOUNT_DEACTIVATED',
    entityType: 'UserAccount',
    entityId: 'usr-guard-09',
    previousState: { active: true },
    newState: { active: false, reason: 'Contract ended' },
    ipAddress: '103.21.44.8',
    timestamp: '2025-11-09T11:00:00.000Z',
  },
  {
    id: 'aud-006',
    actorUserId: 'usr-warden-7',
    actorRole: 'Hostel Warden',
    actionName: 'EMERGENCY_CONTACT_ACCESSED',
    entityType: 'StudentProfile',
    entityId: 'stu-4410',
    previousState: null,
    newState: { incidentId: 'inc-220', fields: ['guardianPhone'] },
    ipAddress: '117.203.88.2',
    timestamp: '2025-11-08T22:14:00.000Z',
  },
  {
    id: 'aud-007',
    actorUserId: 'system',
    actorRole: 'System',
    actionName: 'COMPLAINT_AUTO_CLOSED',
    entityType: 'MaintenanceTicket',
    entityId: 'cmp-1182',
    previousState: { status: 'Resolved', studentFeedback: null },
    newState: { status: 'Closed', reason: 'Inactivity window FR-072' },
    ipAddress: null,
    timestamp: '2025-11-08T06:00:00.000Z',
  },
  {
    id: 'aud-008',
    actorUserId: 'usr-admin-1',
    actorRole: 'University Administrator',
    actionName: 'ADMISSION_VERIFIED',
    entityType: 'StudentRegistration',
    entityId: 'reg-9920',
    previousState: { adminVerification: 'Pending' },
    newState: { adminVerification: 'Verified', frRef: 'FR-011' },
    ipAddress: '103.21.44.8',
    timestamp: '2025-11-07T16:40:00.000Z',
  },
  {
    id: 'aud-009',
    actorUserId: 'usr-warden-12',
    actorRole: 'Hostel Warden',
    actionName: 'DISCIPLINARY_RECORD_CREATED',
    entityType: 'DisciplinaryRecord',
    entityId: 'disc-091',
    previousState: null,
    newState: { sanction: 'Written Warning', frRef: 'FR-103' },
    ipAddress: '117.203.88.2',
    timestamp: '2025-11-07T10:05:00.000Z',
  },
  {
    id: 'aud-010',
    actorUserId: 'usr-admin-1',
    actorRole: 'University Administrator',
    actionName: 'CONFIG_PUBLISHED',
    entityType: 'SystemConfiguration',
    entityId: 'cfg-incidents',
    previousState: { ackMinutes: 15 },
    newState: { ackMinutes: 12, frRef: 'FR-114' },
    ipAddress: '103.21.44.8',
    timestamp: '2025-11-06T14:30:00.000Z',
  },
];

export const FR_HINTS: Record<string, string> = {
  ROLE_ASSIGNMENT_CHANGED: 'FR-140',
  USER_ACCOUNT_DEACTIVATED: 'FR-140',
  BED_ALLOCATION_CREATED: 'FR-141',
  ADMISSION_VERIFIED: 'FR-141',
  FEE_ADJUSTMENT_RECORDED: 'FR-142',
  EMERGENCY_CONTACT_ACCESSED: 'FR-144',
  DISCIPLINARY_RECORD_CREATED: 'FR-143',
  COMPLAINT_AUTO_CLOSED: 'FR-072',
};

export function getAuditLogById(id: string): AuditLogRow | undefined {
  return SAMPLE_AUDIT_LOGS.find((l) => l.id === id);
}

export function formatAuditWhen(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
}

export function formatState(value: unknown): string {
  if (value === null || value === undefined) return '—';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
