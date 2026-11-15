import {
  decideFeeAdjustmentBodySchema,
  feeAdjustmentIdParamsSchema,
  financeDeskListQuerySchema,
  financeLedgerIdParamsSchema,
  proposeFeeWaiverBodySchema,
  recordOfflinePaymentBodySchema,
} from '@nestora/validators';
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
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF', 'ACCOUNTANT');

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
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF', 'ACCOUNTANT');

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
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF', 'ACCOUNTANT');

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

export async function postRecordOfflinePaymentHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'ACCOUNTANT');
  const body = recordOfflinePaymentBodySchema.parse(request.body);
  const result = await service.recordOfflinePayment(request.server.prisma, user.id, body);
  reply.send(successResponse(result, 'Offline payment recorded.'));
}

export async function postProposeFeeWaiverHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'ACCOUNTANT', 'HOSTEL_WARDEN');
  const body = proposeFeeWaiverBodySchema.parse(request.body);
  const result = await service.proposeFeeWaiver(request.server.prisma, user.id, body);
  reply.send(successResponse(result, 'Fee waiver submitted for approval.'));
}

export async function postDecideFeeAdjustmentHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR');
  const { adjustmentId } = feeAdjustmentIdParamsSchema.parse(request.params);
  const body = decideFeeAdjustmentBodySchema.parse(request.body);
  await service.decideFeeAdjustment(request.server.prisma, user.id, adjustmentId, body);
  reply.send(successResponse({ adjustmentId, decision: body.decision }, 'Fee adjustment decision recorded.'));
}

export async function postQueuePaymentReminderHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'ACCOUNTANT', 'HOSTEL_WARDEN');
  const { ledgerId } = financeLedgerIdParamsSchema.parse(request.params);
  const result = await service.queuePaymentReminderForLedger(request.server.prisma, ledgerId);
  reply.send(
    successResponse(
      result,
      result.notified ? 'Payment reminder sent to the student.' : 'A reminder was already sent in the last 24 hours.',
    ),
  );
}

export async function postAssessLedgerFromScheduleHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = requireAuth(request);
  assertRole(user, 'UNIVERSITY_ADMINISTRATOR', 'ACCOUNTANT');
  const { ledgerId } = financeLedgerIdParamsSchema.parse(request.params);
  const result = await service.assessStudentLedgerFromSchedule(request.server.prisma, ledgerId);
  reply.send(successResponse(result, 'Ledger assessed from active fee schedule.'));
}
