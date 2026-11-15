export type SettingsCatalogCategory =
  | 'Institution'
  | 'Operations'
  | 'Security'
  | 'Communications'
  | 'Finance'
  | 'Safety';

export type SettingsCatalogEntry = {
  id: string;
  code: string;
  title: string;
  description: string;
  category: SettingsCatalogCategory;
  frRef: string;
  risk: 'low' | 'medium' | 'high';
  controlsCount: number;
  scope: 'University-wide' | 'Hostel overrides';
  auditHints: string[];
};

export const SETTINGS_CATALOG: SettingsCatalogEntry[] = [
  {
    id: 'cfg-general',
    code: 'SET-01',
    title: 'Institution profile',
    description: 'University name, academic session, timezone, and default locale for all modules.',
    category: 'Institution',
    frRef: 'FR-017',
    risk: 'medium',
    controlsCount: 12,
    scope: 'University-wide',
    auditHints: ['UNIVERSITY', 'HOSTEL_CREATED', 'HOSTEL_UPDATED'],
  },
  {
    id: 'cfg-hostel-ops',
    code: 'SET-02',
    title: 'Hostel operations',
    description: 'Quiet hours templates, curfew defaults, and check-in windows for warden desks.',
    category: 'Operations',
    frRef: 'FR-100',
    risk: 'low',
    controlsCount: 9,
    scope: 'Hostel overrides',
    auditHints: ['HOSTEL', 'HOSTEL_RULE'],
  },
  {
    id: 'cfg-attendance',
    code: 'SET-03',
    title: 'Attendance & roll call',
    description: 'Roll-call cutoffs, discrepancy windows, and consecutive-absence escalation (FR-051).',
    category: 'Operations',
    frRef: 'FR-051',
    risk: 'high',
    controlsCount: 8,
    scope: 'Hostel overrides',
    auditHints: ['ATTENDANCE'],
  },
  {
    id: 'cfg-visitors',
    code: 'SET-04',
    title: 'Visitor policy',
    description: 'Visiting hours, max duration, and guard-console enforcement (FR-062).',
    category: 'Safety',
    frRef: 'FR-062',
    risk: 'medium',
    controlsCount: 7,
    scope: 'Hostel overrides',
    auditHints: ['VISITOR', 'GATE'],
  },
  {
    id: 'cfg-incidents',
    code: 'SET-05',
    title: 'Incident escalation',
    description: 'Unacknowledged incident timers and administrator routing (FR-114).',
    category: 'Safety',
    frRef: 'FR-114',
    risk: 'high',
    controlsCount: 6,
    scope: 'University-wide',
    auditHints: ['INCIDENT', 'EMERGENCY'],
  },
  {
    id: 'cfg-notifications',
    code: 'SET-06',
    title: 'Notifications & inbox',
    description: 'User preferences for non-critical channels; critical alerts are locked (FR-120 – FR-121).',
    category: 'Communications',
    frRef: 'FR-121',
    risk: 'low',
    controlsCount: 14,
    scope: 'University-wide',
    auditHints: ['NOTICE', 'ANNOUNCEMENT'],
  },
  {
    id: 'cfg-security',
    code: 'SET-07',
    title: 'Access & sessions',
    description: 'Session timeout, password policy, and MFA requirements for admin roles.',
    category: 'Security',
    frRef: 'FR-140',
    risk: 'high',
    controlsCount: 11,
    scope: 'University-wide',
    auditHints: ['MFA', 'LOGIN', 'USER_PROVISIONED', 'PASSWORD'],
  },
  {
    id: 'cfg-fees',
    code: 'SET-08',
    title: 'Fee automation',
    description: 'Grace periods, late-fee rules, and reminder cadence (FR-078, FR-081).',
    category: 'Finance',
    frRef: 'FR-078',
    risk: 'medium',
    controlsCount: 10,
    scope: 'University-wide',
    auditHints: ['FEE', 'PAYMENT', 'LEDGER'],
  },
  {
    id: 'cfg-maintenance',
    code: 'SET-09',
    title: 'Maintenance SLAs',
    description: 'Default complaint categories, auto-close windows, and staff routing (FR-072).',
    category: 'Operations',
    frRef: 'FR-072',
    risk: 'low',
    controlsCount: 8,
    scope: 'Hostel overrides',
    auditHints: ['COMPLAINT', 'TICKET'],
  },
  {
    id: 'cfg-roles',
    code: 'SET-10',
    title: 'Role integrations',
    description: 'Links to Roles & Permissions; quick toggles for cross-module feature flags.',
    category: 'Security',
    frRef: 'FR-019',
    risk: 'medium',
    controlsCount: 5,
    scope: 'University-wide',
    auditHints: ['USER_PROVISIONED', 'ROLE'],
  },
];

export const CRITICAL_LOCKED_CONTROLS = 4;
