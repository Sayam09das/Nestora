import type {
  ApiErrorResponse,
  ApiPaginationMeta,
  ApiResponseMeta,
  ApiSuccessResponse,
} from '@nestora/types';

export type SuccessMetaInput = Pick<ApiResponseMeta, 'pagination'> & {
  timestamp?: string;
};

export function successResponse<T>(
  data: T,
  message: string,
  meta?: SuccessMetaInput,
): ApiSuccessResponse<T> {
  const responseMeta: ApiResponseMeta = {
    timestamp: meta?.timestamp ?? new Date().toISOString(),
    ...(meta?.pagination !== undefined ? { pagination: meta.pagination } : {}),
  };

  return {
    success: true,
    data,
    message,
    meta: responseMeta,
  };
}

export type ErrorResponseOptions = {
  details?: Record<string, unknown>;
  correlationId?: string;
};

export function errorResponse(
  code: string,
  message: string,
  options?: ErrorResponseOptions,
): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      ...(options?.details !== undefined ? { details: options.details } : {}),
      ...(options?.correlationId !== undefined ? { correlation_id: options.correlationId } : {}),
    },
  };
}

export function paginatedSuccessResponse<T>(
  data: T,
  message: string,
  pagination: ApiPaginationMeta,
): ApiSuccessResponse<T> {
  return successResponse(data, message, { pagination });
}
