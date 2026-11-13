import type { Role } from '@nestora/database';

export type RoleCatalogTier = 'System' | 'Operations' | 'Resident' | 'Field';
export type RoleCatalogScope = 'University-wide' | 'Hostel-scoped' | 'Self';

export type RoleCatalogEntry = {
  id: string;
  dbRole: Role;
  code: string;
  title: string;
  description: string;
  tier: RoleCatalogTier;
  frRef: string;
  scope: RoleCatalogScope;
  risk: 'low' | 'medium' | 'high' | 'critical';
  auditHints: string[];
};

export const ROLE_CATALOG: RoleCatalogEntry[] = [
  {
    id: 'role-admin',
    dbRole: 'UNIVERSITY_ADMINISTRATOR',
    code: 'ROL-01',
    title: 'University Administrator',
    description:
      'Full institutional oversight: hostels, admissions, fees policy, escalations, and cross-hostel reports.',
    tier: 'System',
    frRef: 'FR-006',
    scope: 'University-wide',
    risk: 'critical',
    auditHints: ['UNIVERSITY_ADMINISTRATOR', 'USER_PROVISIONED', 'ROLE'],
  },
  {
    id: 'role-warden',
    dbRole: 'HOSTEL_WARDEN',
    code: 'ROL-02',
    title: 'Hostel Warden',
    description: 'Operational control for assigned hostel: leave, attendance, complaints, scoped reports (FR-139).',
    tier: 'Operations',
    frRef: 'FR-124',
    scope: 'Hostel-scoped',
    risk: 'high',
    auditHints: ['HOSTEL_WARDEN', 'HOSTEL_ASSIGNMENT'],
  },
  {
    id: 'role-student',
    dbRole: 'STUDENT',
    code: 'ROL-03',
    title: 'Student',
    description: 'Self-service dashboard: room, leave, fees, complaints, notices (FR-125).',
    tier: 'Resident',
    frRef: 'FR-002',
    scope: 'Self',
    risk: 'low',
    auditHints: ['STUDENT', 'STUDENT_REGISTERED'],
  },
  {
    id: 'role-staff',
    dbRole: 'HOSTEL_STAFF',
    code: 'ROL-04',
    title: 'Hostel Staff',
    description: 'Maintenance work orders and shift notes scoped to assigned hostel (FR-126).',
    tier: 'Field',
    frRef: 'FR-092',
    scope: 'Hostel-scoped',
    risk: 'medium',
    auditHints: ['HOSTEL_STAFF', 'STAFF_REGISTERED'],
  },
  {
    id: 'role-guard',
    dbRole: 'SECURITY_GUARD',
    code: 'ROL-05',
    title: 'Security Guard',
    description: 'Gate verification, visitor registration, movement logging (FR-127).',
    tier: 'Field',
    frRef: 'FR-127',
    scope: 'Hostel-scoped',
    risk: 'medium',
    auditHints: ['SECURITY_GUARD', 'GATE', 'VISITOR'],
  },
  {
    id: 'role-accountant',
    dbRole: 'ACCOUNTANT',
    code: 'ROL-06',
    title: 'Accountant',
    description: 'Fee schedules, collections, reminders, offline payment entry (FR-128).',
    tier: 'Operations',
    frRef: 'FR-074',
    scope: 'University-wide',
    risk: 'high',
    auditHints: ['ACCOUNTANT', 'FEE', 'PAYMENT'],
  },
];

export const MATRIX_MODULE_COUNT = 12;
