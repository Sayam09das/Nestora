import { AppError } from './app-error.js';

export class BadRequestError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({ statusCode: 400, code: 'BAD_REQUEST', message, details });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({ statusCode: 401, code: 'UNAUTHORIZED', message, details });
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({ statusCode: 403, code: 'FORBIDDEN', message, details });
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({ statusCode: 404, code: 'NOT_FOUND', message, details });
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({ statusCode: 409, code: 'CONFLICT', message, details });
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({ statusCode: 422, code: 'UNPROCESSABLE_ENTITY', message, details });
  }
}

export class LockedError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({ statusCode: 423, code: 'LOCKED', message, details });
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({ statusCode: 429, code: 'RATE_LIMIT_EXCEEDED', message, details });
  }
}

export class InternalError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({ statusCode: 500, code: 'INTERNAL_ERROR', message, details });
  }
}
