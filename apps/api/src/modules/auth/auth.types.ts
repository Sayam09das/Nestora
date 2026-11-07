import type { Role } from '@nestora/database';

export type SessionContext = {
  user: {
    id: string;
    email: string;
    role: Role;
    firstName: string;
    lastName: string;
    status: string;
    isVerified: boolean;
    mfaEnabled: boolean;
    assignedHostelIds: string[];
  };
  sessionId: string;
  requiresMfa: boolean;
};
