import type { LucideIcon } from 'lucide-react';
import { Bell, Building2, CreditCard, Globe2, Lock, Siren } from 'lucide-react';

export type SettingsCategory =
  | 'Institution'
  | 'Operations'
  | 'Security'
  | 'Communications'
  | 'Finance'
  | 'Safety';

export type SettingsPanelStatus = 'Synced' | 'Draft' | 'Pending approval';

export type SettingsPanel = {
  id: string;
  code: string;
  title: string;
  description: string;
  category: SettingsCategory;
  frRef: string;
  lastModified: string;
  status: SettingsPanelStatus;
  risk: 'low' | 'medium' | 'high';
  controlsCount: number;
  sparkline: number[];
};

export const SETTINGS_STATS = {
  panels: 10,
  pendingDrafts: 2,
  criticalLocks: 4,
  lastPublishHours: 6,
  environment: 'Production',
} as const;

export const SETTINGS_CATEGORY_FILTERS = [
  'All Categories',
  'Institution',
  'Operations',
  'Security',
  'Communications',
  'Finance',
  'Safety',
] as const;

export const SETTINGS_SCOPE_FILTERS = ['All scopes', 'University-wide', 'Hostel overrides'] as const;

export const SETTINGS_STATUS_FILTERS = ['All status', 'Synced', 'Draft', 'Pending approval'] as const;

export const CATEGORY_META: Record<SettingsCategory, { icon: LucideIcon; accent: string }> = {
  Institution: { icon: Globe2, accent: 'var(--nestora-forest)' },
  Operations: { icon: Building2, accent: '#0284c7' },
  Security: { icon: Lock, accent: '#7c3aed' },
  Communications: { icon: Bell, accent: 'var(--nestora-gold)' },
  Finance: { icon: CreditCard, accent: '#059669' },
  Safety: { icon: Siren, accent: '#dc2626' },
};

export const SAMPLE_PANELS: SettingsPanel[] = [
  {
    id: 'cfg-general',
    code: 'SET-01',
    title: 'Institution profile',
    description: 'University name, academic session, timezone, and default locale for all modules.',
    category: 'Institution',
    frRef: 'FR-017',
    lastModified: '2025-11-08T14:22:00.000Z',
    status: 'Synced',
    risk: 'medium',
    controlsCount: 12,
    sparkline: [3, 4, 2, 5, 3, 4, 6],
  },
  {
    id: 'cfg-hostel-ops',
    code: 'SET-02',
    title: 'Hostel operations',
    description: 'Quiet hours templates, curfew defaults, and check-in windows for warden desks.',
    category: 'Operations',
    frRef: 'FR-100',
    lastModified: '2025-11-09T09:10:00.000Z',
    status: 'Synced',
    risk: 'low',
    controlsCount: 9,
    sparkline: [2, 3, 3, 2, 4, 3, 3],
  },
  {
    id: 'cfg-attendance',
    code: 'SET-03',
    title: 'Attendance & roll call',
    description: 'Roll-call cutoffs, discrepancy windows, and consecutive-absence escalation (FR-051).',
    category: 'Operations',
    frRef: 'FR-051',
    lastModified: '2025-11-07T18:40:00.000Z',
    status: 'Draft',
    risk: 'high',
    controlsCount: 8,
    sparkline: [5, 6, 4, 7, 8, 6, 5],
  },
  {
    id: 'cfg-visitors',
    code: 'SET-04',
    title: 'Visitor policy',
    description: 'Visiting hours, max duration, and guard-console enforcement (FR-062).',
    category: 'Safety',
    frRef: 'FR-062',
    status: 'Synced',
    lastModified: '2025-11-05T11:00:00.000Z',
    risk: 'medium',
    controlsCount: 7,
    sparkline: [1, 2, 2, 3, 2, 2, 1],
  },
  {
    id: 'cfg-incidents',
    code: 'SET-05',
    title: 'Incident escalation',
    description: 'Unacknowledged incident timers and administrator routing (FR-114).',
    category: 'Safety',
    frRef: 'FR-114',
    lastModified: '2025-11-10T06:15:00.000Z',
    status: 'Pending approval',
    risk: 'high',
    controlsCount: 6,
    sparkline: [4, 5, 5, 6, 4, 5, 7],
  },
  {
    id: 'cfg-notifications',
    code: 'SET-06',
    title: 'Notifications & inbox',
    description: 'User preferences for non-critical channels; critical alerts are locked (FR-120 – FR-121).',
    category: 'Communications',
    frRef: 'FR-121',
    lastModified: '2025-11-06T16:30:00.000Z',
    status: 'Synced',
    risk: 'low',
    controlsCount: 14,
    sparkline: [6, 5, 7, 6, 8, 7, 6],
  },
  {
    id: 'cfg-security',
    code: 'SET-07',
    title: 'Access & sessions',
    description: 'Session timeout, password policy, and MFA requirements for admin roles.',
    category: 'Security',
    frRef: 'FR-140',
    lastModified: '2025-11-04T08:00:00.000Z',
    status: 'Synced',
    risk: 'high',
    controlsCount: 11,
    sparkline: [2, 2, 3, 2, 3, 2, 2],
  },
  {
    id: 'cfg-fees',
    code: 'SET-08',
    title: 'Fee automation',
    description: 'Grace periods, late-fee rules, and reminder cadence (FR-078, FR-081).',
    category: 'Finance',
    frRef: 'FR-078',
    lastModified: '2025-11-03T13:45:00.000Z',
    status: 'Draft',
    risk: 'medium',
    controlsCount: 10,
    sparkline: [3, 4, 4, 5, 4, 3, 4],
  },
  {
    id: 'cfg-maintenance',
    code: 'SET-09',
    title: 'Maintenance SLAs',
    description: 'Default complaint categories, auto-close windows, and staff routing (FR-072).',
    category: 'Operations',
    frRef: 'FR-072',
    lastModified: '2025-11-02T10:20:00.000Z',
    status: 'Synced',
    risk: 'low',
    controlsCount: 8,
    sparkline: [2, 3, 2, 2, 3, 2, 3],
  },
  {
    id: 'cfg-roles',
    code: 'SET-10',
    title: 'Role integrations',
    description: 'Links to Roles & Permissions; quick toggles for cross-module feature flags.',
    category: 'Security',
    frRef: 'FR-019',
    lastModified: '2025-11-01T15:00:00.000Z',
    status: 'Synced',
    risk: 'medium',
    controlsCount: 5,
    sparkline: [1, 1, 2, 1, 2, 1, 1],
  },
];

export const DEFAULT_PANEL_ID = 'cfg-general';

export function getSettingsPanelById(id: string): SettingsPanel | undefined {
  return SAMPLE_PANELS.find((p) => p.id === id);
}

export function formatSettingsWhen(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
}

export type SettingField = {
  key: string;
  label: string;
  type: 'toggle' | 'number' | 'text' | 'select' | 'locked';
  value: string | number | boolean;
  help?: string;
  options?: string[];
};

export const PANEL_FIELDS: Record<string, SettingField[]> = {
  'cfg-general': [
    { key: 'univ_name', label: 'University display name', type: 'text', value: 'Nestora State University' },
    { key: 'session', label: 'Active academic session', type: 'select', value: '2025–26', options: ['2024–25', '2025–26', '2026–27'] },
    { key: 'timezone', label: 'Default timezone', type: 'select', value: 'Asia/Kolkata', options: ['Asia/Kolkata', 'Asia/Dubai', 'UTC'] },
    { key: 'locale', label: 'Number & currency locale', type: 'select', value: 'en-IN', options: ['en-IN', 'en-US'] },
  ],
  'cfg-attendance': [
    { key: 'roll_cutoff', label: 'Roll call lock (minutes after curfew)', type: 'number', value: 45 },
    { key: 'dispute_window', label: 'Dispute window (hours)', type: 'number', value: 72, help: 'FR-049' },
    { key: 'absence_threshold', label: 'Consecutive absence alert threshold', type: 'number', value: 3, help: 'FR-051' },
    { key: 'auto_escalate', label: 'Notify administrator on threshold', type: 'toggle', value: true },
  ],
  'cfg-notifications': [
    { key: 'email_digest', label: 'Daily email digest for wardens', type: 'toggle', value: true, help: 'FR-120' },
    { key: 'student_marketing', label: 'Student event announcements (email)', type: 'toggle', value: false, help: 'FR-120' },
    { key: 'emergency_lock', label: 'Emergency & fee notices', type: 'locked', value: true, help: 'Always on — FR-121' },
    { key: 'disciplinary_lock', label: 'Disciplinary summons', type: 'locked', value: true, help: 'FR-121' },
  ],
  'cfg-incidents': [
    { key: 'ack_minutes', label: 'Escalate if unacknowledged (minutes)', type: 'number', value: 15, help: 'FR-114' },
    { key: 'critical_only', label: 'Escalate High/Critical only', type: 'toggle', value: true },
    { key: 'guardian_auto', label: 'Auto-notify guardians (High/Critical)', type: 'toggle', value: true, help: 'FR-116' },
  ],
  'cfg-visitors': [
    { key: 'visit_start', label: 'Visiting hours start', type: 'text', value: '09:00' },
    { key: 'visit_end', label: 'Visiting hours end', type: 'text', value: '19:00' },
    { key: 'max_duration', label: 'Max visit duration (minutes)', type: 'number', value: 120, help: 'FR-062' },
  ],
  'cfg-fees': [
    { key: 'grace_days', label: 'Late fee grace period (days)', type: 'number', value: 7, help: 'FR-078' },
    { key: 'reminder_days', label: 'Reminder cadence (days before due)', type: 'number', value: 3, help: 'FR-081' },
    { key: 'auto_late', label: 'Apply late fee automatically', type: 'toggle', value: true },
  ],
};

export const SAMPLE_CHANGE_LOG: Record<string, Array<{ when: string; actor: string; change: string }>> = {
  'cfg-general': [
    { when: '2025-11-08T14:22:00.000Z', actor: 'Admin · Priya N.', change: 'Updated academic session to 2025–26' },
    { when: '2025-10-12T09:00:00.000Z', actor: 'Admin · Priya N.', change: 'Timezone confirmed Asia/Kolkata' },
  ],
  'cfg-incidents': [
    { when: '2025-11-10T06:15:00.000Z', actor: 'Admin · Vikram S.', change: 'Proposed escalation 15 → 12 minutes' },
    { when: '2025-09-01T11:30:00.000Z', actor: 'System', change: 'Baseline policy imported' },
  ],
};
