import type { FastifyReply, FastifyRequest } from 'fastify';
import { ForbiddenError } from '../../../common/errors/index.js';
import type { RoleCode } from '../../../middleware/authorize.js';
import { requireAuthenticated } from './authentication.guard.js';

export function requireRoles(...allowed: RoleCode[]) {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    const ctx = requireAuthenticated(request);
    if (!allowed.includes(ctx.user.role as RoleCode)) {
      throw new ForbiddenError('You do not have permission to perform this action.');
    }
  };
}
