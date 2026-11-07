/** Canonical Nestora roles (matches Prisma `Role` enum). */
export const NESTORA_ROLES = [
  'UNIVERSITY_ADMINISTRATOR',
  'HOSTEL_WARDEN',
  'STUDENT',
  'HOSTEL_STAFF',
  'SECURITY_GUARD',
  'ACCOUNTANT',
] as const;

export type NestoraRole = (typeof NESTORA_ROLES)[number];

/**
 * FR-002: stable landing paths for each role (Next.js `(dashboard)` namespaces).
 * Bump `ROLE_DASHBOARD_CONTRACT_VERSION` when paths change.
 */
export const ROLE_DASHBOARD_CONTRACT_VERSION = '1' as const;

export const ROLE_DASHBOARD_PATH: Record<NestoraRole, string> = {
  UNIVERSITY_ADMINISTRATOR: '/admin',
  HOSTEL_WARDEN: '/warden',
  STUDENT: '/student',
  HOSTEL_STAFF: '/staff',
  SECURITY_GUARD: '/guard',
  ACCOUNTANT: '/accountant',
};

export function dashboardPathForRole(role: string): string {
  if ((NESTORA_ROLES as readonly string[]).includes(role)) {
    return ROLE_DASHBOARD_PATH[role as NestoraRole];
  }
  return '/login';
}
