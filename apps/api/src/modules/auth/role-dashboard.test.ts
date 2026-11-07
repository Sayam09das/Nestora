import { dashboardPathForRole, ROLE_DASHBOARD_PATH } from '@nestora/types';
import { describe, expect, it } from 'vitest';

describe('FR-002 role dashboard contract', () => {
  it('maps each role to a dashboard path', () => {
    for (const [role, path] of Object.entries(ROLE_DASHBOARD_PATH)) {
      expect(dashboardPathForRole(role)).toBe(path);
    }
  });
});
