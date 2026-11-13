import { financeDeskListQuerySchema, financeLedgerIdParamsSchema } from '@nestora/validators';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { NotFoundError } from '../../common/errors/index.js';
import { paginatedSuccessResponse, successResponse } from '../../common/api-response.js';
import {
  isHostelOperationalRole,
  resolveOperationalHostelNames,
} from '../../common/helpers/warden-hostel-scope.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { assertRole } from '../../middleware/authorize.js';
import * as service from './finance.service.js';

export async function getFinanceDeskSummaryHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

  if (isHostelOperationalRole(user.role)) {
    const hostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
    const summary = await service.getFinanceDeskSummary(request.server.prisma, hostelNames);
    reply.send(successResponse({ summary }, 'Finance desk summary loaded.'));
    return;
  }

  const summary = await service.getFinanceDeskSummary(request.server.prisma);
  reply.send(successResponse({ summary }, 'Finance desk summary loaded.'));
}

export async function listFinanceDeskLedgersHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

  const query = financeDeskListQuerySchema.parse(request.query);

  if (isHostelOperationalRole(user.role)) {
    const hostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
    const result = await service.listFinanceDeskLedgers(request.server.prisma, query, hostelNames);
    reply.send(
      paginatedSuccessResponse(
        { ledgers: result.ledgers, collectionTrend: result.collectionTrend },
        'Finance ledgers loaded.',
        result.pagination,
      ),
    );
    return;
  }

  const result = await service.listFinanceDeskLedgers(request.server.prisma, query);
  reply.send(
    paginatedSuccessResponse(
      { ledgers: result.ledgers, collectionTrend: result.collectionTrend },
      'Finance ledgers loaded.',
      result.pagination,
    ),
  );
}

export async function getFinanceLedgerDetailHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF');

  const { ledgerId } = financeLedgerIdParamsSchema.parse(request.params);

  if (isHostelOperationalRole(user.role)) {
    const hostelNames = await resolveOperationalHostelNames(request.server.prisma, user);
    const detail = await service.getFinanceLedgerDetail(request.server.prisma, ledgerId, hostelNames);
    if (!detail) {
      throw new NotFoundError('Ledger not found.');
    }
    reply.send(successResponse(detail, 'Ledger detail loaded.'));
    return;
  }

  const detail = await service.getFinanceLedgerDetail(request.server.prisma, ledgerId);
  if (!detail) {
    throw new NotFoundError('Ledger not found.');
  }
  reply.send(successResponse(detail, 'Ledger detail loaded.'));
}
