import type { FastifyReply, FastifyRequest } from 'fastify';
import { ForbiddenError } from '../common/errors/index.js';
import { requireAuth } from './authenticate.js';

export function userCanAccessHostel(
  user: { role: string; assignedHostelIds: string[] },
  hostelId: string,
): boolean {
  if (user.role === 'UNIVERSITY_ADMINISTRATOR') {
    return true;
  }
  return user.assignedHostelIds.includes(hostelId);
}

export function requireHostelAccess(hostelIdParam = 'hostelId') {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    const user = requireAuth(request);
    const params = request.params as Record<string, string | undefined>;
    const hostelId = params[hostelIdParam];
    if (!hostelId) {
      return;
    }
    if (!userCanAccessHostel(user, hostelId)) {
      throw new ForbiddenError('You are not authorized for this hostel scope.');
    }
  };
}
