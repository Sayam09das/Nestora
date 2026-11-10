import type { LucideIcon } from 'lucide-react';
import {
  Calculator,
  GraduationCap,
  Shield,
  ShieldCheck,
  UserCog,
  Wrench,
} from 'lucide-react';

export type RoleTier = 'System' | 'Operations' | 'Resident' | 'Field';

export type RoleProfile = {
  id: string;
  code: string;
  title: string;
  description: string;
  tier: RoleTier;
  frRef: string;
  activeUsers: number;
  scope: 'University-wide' | 'Hostel-scoped' | 'Self';
  lastAudit: string;
  risk: 'low' | 'medium' | 'high' | 'critical';
  sparkline: number[];
};

export const ROLES_STATS = {
  roles: 6,
  customGrants: 14,
  pendingReviews: 3,
  hostelsScoped: 4,
  matrixModules: 12,
} as const;

export const ROLE_TIER_FILTERS = ['All tiers', 'System', 'Operations', 'Resident', 'Field'] as const;
export const ROLE_SCOPE_FILTERS = ['All scopes', 'University-wide', 'Hostel-scoped', 'Self'] as const;
export const ROLE_RISK_FILTERS = ['All risk', 'low', 'medium', 'high', 'critical'] as const;

export const TIER_META: Record<RoleTier, { accent: string }> = {
  System: { accent: 'var(--nestora-forest)' },
  Operations: { accent: '#0284c7' },
  Resident: { accent: 'var(--nestora-sage)' },
  Field: { accent: 'var(--nestora-gold)' },
};

export const ROLE_ICONS: Record<string, LucideIcon> = {
  'role-admin': ShieldCheck,
  'role-warden': UserCog,
  'role-student': GraduationCap,
  'role-staff': Wrench,
  'role-guard': Shield,
  'role-accountant': Calculator,
};

export const SAMPLE_ROLES: RoleProfile[] = [
  {
    id: 'role-admin',
    code: 'ROL-01',
    title: 'University Administrator',
    description: 'Full institutional oversight: hostels, admissions, fees policy, escalations, and cross-hostel reports.',
    tier: 'System',
    frRef: 'FR-006',
    activeUsers: 4,
    scope: 'University-wide',
    lastAudit: '2025-11-09T16:00:00.000Z',
    risk: 'critical',
    sparkline: [8, 9, 7, 10, 9, 8, 9],
  },
  {
    id: 'role-warden',
    code: 'ROL-02',
    title: 'Hostel Warden',
    description: 'Operational control for assigned hostel: leave, attendance, complaints, scoped reports (FR-139).',
    tier: 'Operations',
    frRef: 'FR-124',
    activeUsers: 12,
    scope: 'Hostel-scoped',
    lastAudit: '2025-11-10T08:30:00.000Z',
    risk: 'high',
    sparkline: [6, 7, 8, 7, 9, 8, 8],
  },
  {
    id: 'role-student',
    code: 'ROL-03',
    title: 'Student',
    description: 'Self-service dashboard: room, leave, fees, complaints, notices (FR-125).',
    tier: 'Resident',
    frRef: 'FR-002',
    activeUsers: 2840,
    scope: 'Self',
    lastAudit: '2025-11-08T12:00:00.000Z',
    risk: 'low',
    sparkline: [5, 6, 6, 5, 7, 6, 6],
  },
  {
    id: 'role-staff',
    code: 'ROL-04',
    title: 'Hostel Staff',
    description: 'Maintenance work orders and shift notes scoped to assigned hostel (FR-126).',
    tier: 'Field',
    frRef: 'FR-092',
    activeUsers: 38,
    scope: 'Hostel-scoped',
    lastAudit: '2025-11-07T14:20:00.000Z',
    risk: 'medium',
    sparkline: [3, 4, 3, 4, 3, 4, 5],
  },
  {
    id: 'role-guard',
    code: 'ROL-05',
    title: 'Security Guard',
    description: 'Gate verification, visitor registration, movement logging (FR-127).',
    tier: 'Field',
    frRef: 'FR-127',
    activeUsers: 22,
    scope: 'Hostel-scoped',
    lastAudit: '2025-11-06T22:00:00.000Z',
    risk: 'medium',
    sparkline: [2, 3, 3, 2, 3, 2, 3],
  },
  {
    id: 'role-accountant',
    code: 'ROL-06',
    title: 'Accountant',
    description: 'Fee schedules, collections, reminders, offline payment entry (FR-128).',
    tier: 'Operations',
    frRef: 'FR-074',
    activeUsers: 6,
    scope: 'University-wide',
    lastAudit: '2025-11-05T10:15:00.000Z',
    risk: 'high',
    sparkline: [4, 4, 5, 4, 5, 4, 4],
  },
];

export const DEFAULT_ROLE_ID = 'role-admin';

export function getRoleById(id: string): RoleProfile | undefined {
  return SAMPLE_ROLES.find((r) => r.id === id);
}

export function formatRoleWhen(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
}

export type PermissionLevel = 'none' | 'read' | 'write' | 'admin';

export type PermissionRow = {
  module: string;
  read: PermissionLevel;
  create: PermissionLevel;
  update: PermissionLevel;
  delete: PermissionLevel;
  notes?: string;
};

const L = {
  none: 'none' as const,
  read: 'read' as const,
  write: 'write' as const,
  admin: 'admin' as const,
};

export const ROLE_PERMISSIONS: Record<string, PermissionRow[]> = {
  'role-admin': [
    { module: 'Students & admissions', read: L.admin, create: L.admin, update: L.admin, delete: L.write, notes: 'FR-010 – FR-017' },
    { module: 'Hostel structure', read: L.admin, create: L.admin, update: L.admin, delete: L.write, notes: 'FR-018 – FR-023' },
    { module: 'Room allocation', read: L.admin, create: L.admin, update: L.admin, delete: L.write },
    { module: 'Fees & ledger', read: L.admin, create: L.write, update: L.admin, delete: L.none, notes: 'FR-074' },
    { module: 'Reports', read: L.admin, create: L.write, update: L.none, delete: L.none, notes: 'FR-139 cross-hostel' },
    { module: 'Roles & accounts', read: L.admin, create: L.admin, update: L.admin, delete: L.write, notes: 'FR-006 – FR-007' },
  ],
  'role-warden': [
    { module: 'Students (assigned hostel)', read: L.write, create: L.write, update: L.write, delete: L.none },
    { module: 'Attendance', read: L.write, create: L.write, update: L.write, delete: L.none },
    { module: 'Leave & outings', read: L.write, create: L.none, update: L.admin, delete: L.none },
    { module: 'Complaints', read: L.write, create: L.none, update: L.admin, delete: L.none },
    { module: 'Reports', read: L.read, create: L.write, update: L.none, delete: L.none, notes: 'FR-139 hostel only' },
    { module: 'Staff provisioning', read: L.write, create: L.write, update: L.write, delete: L.none, notes: 'Staff/Guard only' },
  ],
  'role-student': [
    { module: 'Own profile', read: L.read, create: L.none, update: L.write, delete: L.none },
    { module: 'Leave requests', read: L.read, create: L.write, update: L.write, delete: L.none },
    { module: 'Complaints', read: L.read, create: L.write, update: L.write, delete: L.none },
    { module: 'Fees (view)', read: L.read, create: L.none, update: L.none, delete: L.none },
    { module: 'Notices', read: L.read, create: L.none, update: L.none, delete: L.none },
    { module: 'Emergency report', read: L.none, create: L.write, update: L.none, delete: L.none, notes: 'FR-108' },
  ],
  'role-staff': [
    { module: 'Maintenance tickets', read: L.write, create: L.none, update: L.write, delete: L.none },
    { module: 'Room status', read: L.read, create: L.none, update: L.write, delete: L.none },
    { module: 'Shift notes', read: L.write, create: L.write, update: L.write, delete: L.none },
  ],
  'role-guard': [
    { module: 'Gate pass lookup', read: L.write, create: L.none, update: L.none, delete: L.none },
    { module: 'Visitors', read: L.write, create: L.write, update: L.write, delete: L.none, notes: 'FR-062' },
    { module: 'Movement log', read: L.write, create: L.write, update: L.none, delete: L.none },
    { module: 'Emergency trigger', read: L.none, create: L.write, update: L.none, delete: L.none },
  ],
  'role-accountant': [
    { module: 'Fee schedules', read: L.write, create: L.write, update: L.write, delete: L.none, notes: 'FR-074' },
    { module: 'Collections', read: L.admin, create: L.write, update: L.write, delete: L.none },
    { module: 'Reminders', read: L.write, create: L.write, update: L.none, delete: L.none, notes: 'FR-081' },
    { module: 'Reports (financial)', read: L.read, create: L.write, update: L.none, delete: L.none },
  ],
};

export const SAMPLE_ASSIGNMENTS: Record<string, Array<{ user: string; hostel: string; since: string }>> = {
  'role-warden': [
    { user: 'Arjun Mehta', hostel: 'Boys Hostel A', since: '2024-08-01' },
    { user: 'Neha Krishnan', hostel: 'Girls Hostel B', since: '2023-06-15' },
  ],
  'role-admin': [{ user: 'Priya Nair', hostel: 'University-wide', since: '2022-01-10' }],
};

export function permissionLabel(level: PermissionLevel): string {
  if (level === 'none') return '—';
  return level.charAt(0).toUpperCase() + level.slice(1);
}
