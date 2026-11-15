/** Sidebar visibility — student scope only; never admin/warden/staff desks. */
export type StudentNavPermission =
  | 'overview.dashboard'
  | 'hostel.profile'
  | 'hostel.room'
  | 'hostel.attendance'
  | 'hostel.roommates'
  | 'services.leave'
  | 'services.outings'
  | 'services.gatepasses'
  | 'services.complaints'
  | 'services.maintenance'
  | 'services.visitors'
  | 'services.fees'
  | 'info.announcements'
  | 'info.messages'
  | 'info.events'
  | 'info.rules'
  | 'info.emergency'
  | 'account.settings'
  | 'account.help';

export type StudentNavBadgeKey =
  | 'leave'
  | 'complaints'
  | 'maintenance'
  | 'fees'
  | 'announcements'
  | 'visitors';

/** When `false`, Fee & Payments is omitted from nav and search (hostel without online fees). */
export const STUDENT_FEES_ONLINE_STORAGE_KEY = 'nestora-student-fees-online';

const BASE_PERMISSIONS: readonly StudentNavPermission[] = [
  'overview.dashboard',
  'hostel.profile',
  'hostel.room',
  'hostel.attendance',
  'hostel.roommates',
  'services.leave',
  'services.outings',
  'services.gatepasses',
  'services.complaints',
  'services.maintenance',
  'services.visitors',
  'info.announcements',
  'info.messages',
  'info.events',
  'info.rules',
  'info.emergency',
  'account.settings',
  'account.help',
];

export function readStudentFeesOnlineEnabled(): boolean {
  try {
    const raw = localStorage.getItem(STUDENT_FEES_ONLINE_STORAGE_KEY);
    if (raw === '0') return false;
    if (raw === '1') return true;
  } catch {
    // ignore
  }
  return true;
}

export function createStudentNavPermissions(feesOnlineEnabled: boolean): Set<StudentNavPermission> {
  const set = new Set<StudentNavPermission>(BASE_PERMISSIONS);
  if (feesOnlineEnabled) set.add('services.fees');
  return set;
}

export function studentCanAccess(allowed: ReadonlySet<StudentNavPermission>, permission: StudentNavPermission): boolean {
  return allowed.has(permission);
}
