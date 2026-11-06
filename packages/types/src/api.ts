export type ApiPaginationMeta = {
  page: number;
  limit: number;
  total_records: number;
  total_pages: number;
};

export type ApiResponseMeta = {
  timestamp: string;
  pagination?: ApiPaginationMeta;
};

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  message: string;
  meta?: ApiResponseMeta;
};

export type ApiErrorBody = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  correlation_id?: string;
};

export type ApiErrorResponse = {
  success: false;
  error: ApiErrorBody;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
