/** Sidebar visibility keys — scoped to assigned hostel; no global admin routes. */
export type WardenNavPermission =
  | 'workspace.dashboard'
  | 'workspace.students'
  | 'workspace.rooms'
  | 'workspace.attendance'
  | 'workspace.leave'
  | 'workspace.visitors'
  | 'operations.complaints'
  | 'operations.maintenance'
  | 'operations.incidents'
  | 'operations.events'
  | 'operations.announcements'
  | 'account.reports'
  | 'account.register'
  | 'account.profile'
  | 'account.settings';

export const WARDEN_NAV_PERMISSIONS: WardenNavPermission[] = [
  'workspace.dashboard',
  'workspace.students',
  'workspace.rooms',
  'workspace.attendance',
  'workspace.leave',
  'workspace.visitors',
  'operations.complaints',
  'operations.maintenance',
  'operations.incidents',
  'operations.events',
  'operations.announcements',
  'account.reports',
  'account.register',
  'account.profile',
  'account.settings',
];

/** Demo: full desk access for HOSTEL_WARDEN until API permission matrix is wired. */
export function createDefaultWardenPermissions(): Set<WardenNavPermission> {
  return new Set(WARDEN_NAV_PERMISSIONS);
}

export function wardenCanAccess(
  allowed: ReadonlySet<WardenNavPermission>,
  permission: WardenNavPermission,
): boolean {
  return allowed.has(permission);
}
