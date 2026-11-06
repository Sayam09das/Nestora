import type { ApiErrorResponse, ApiSuccessResponse } from '@nestora/types';

export function successResponse<T>(data: T, message: string): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

export function errorResponse(code: string, message: string): ApiErrorResponse {
  return {
    success: false,
    error: { code, message },
  };
}
