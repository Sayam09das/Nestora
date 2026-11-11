/** Sidebar visibility keys — staff operational scope only (no admin/student desk). */
export type StaffNavPermission =
  | 'workspace.dashboard'
  | 'workspace.tasks'
  | 'workspace.schedule'
  | 'workspace.attendance'
  | 'ops.visitors'
  | 'ops.maintenance'
  | 'ops.housekeeping'
  | 'ops.mess'
  | 'ops.inventory'
  | 'comms.announcements'
  | 'comms.messages'
  | 'comms.report'
  | 'account.profile'
  | 'account.settings';

export type StaffDutyRole =
  | 'security_guard'
  | 'housekeeping'
  | 'maintenance'
  | 'receptionist'
  | 'mess_staff';

export const STAFF_ROLE_LABELS: Record<StaffDutyRole, string> = {
  security_guard: 'Security Staff',
  housekeeping: 'Housekeeping Staff',
  maintenance: 'Maintenance Staff',
  receptionist: 'Receptionist',
  mess_staff: 'Mess Staff',
};

const ROLE_PERMISSIONS: Record<StaffDutyRole, readonly StaffNavPermission[]> = {
  security_guard: [
    'workspace.dashboard',
    'workspace.tasks',
    'workspace.schedule',
    'workspace.attendance',
    'ops.visitors',
    'comms.announcements',
    'comms.messages',
    'comms.report',
    'account.profile',
    'account.settings',
  ],
  housekeeping: [
    'workspace.dashboard',
    'workspace.tasks',
    'workspace.schedule',
    'workspace.attendance',
    'ops.housekeeping',
    'ops.inventory',
    'comms.announcements',
    'comms.messages',
    'account.profile',
    'account.settings',
  ],
  maintenance: [
    'workspace.dashboard',
    'workspace.tasks',
    'workspace.schedule',
    'workspace.attendance',
    'ops.maintenance',
    'ops.inventory',
    'comms.announcements',
    'comms.messages',
    'comms.report',
    'account.profile',
    'account.settings',
  ],
  receptionist: [
    'workspace.dashboard',
    'workspace.tasks',
    'workspace.schedule',
    'workspace.attendance',
    'ops.visitors',
    'comms.announcements',
    'comms.messages',
    'account.profile',
    'account.settings',
  ],
  mess_staff: [
    'workspace.dashboard',
    'workspace.tasks',
    'workspace.schedule',
    'workspace.attendance',
    'ops.mess',
    'ops.inventory',
    'comms.announcements',
    'comms.messages',
    'account.profile',
    'account.settings',
  ],
};

export function createStaffPermissionsForRole(role: StaffDutyRole): Set<StaffNavPermission> {
  return new Set(ROLE_PERMISSIONS[role]);
}

export function staffCanAccess(allowed: ReadonlySet<StaffNavPermission>, permission: StaffNavPermission): boolean {
  return allowed.has(permission);
}

/** Map admin job titles to duty roles until staff profile API returns a canonical role. */
export function mapJobTitleToDutyRole(jobTitle: string | null | undefined): StaffDutyRole {
  const t = (jobTitle ?? '').toLowerCase();
  if (t.includes('security') || t.includes('guard')) return 'security_guard';
  if (t.includes('housekeeping') || t.includes('cleaning')) return 'housekeeping';
  if (t.includes('maintenance') || t.includes('repair')) return 'maintenance';
  if (t.includes('reception')) return 'receptionist';
  if (t.includes('mess') || t.includes('kitchen') || t.includes('catering')) return 'mess_staff';
  return 'security_guard';
}
