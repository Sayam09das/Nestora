import type { ApiErrorResponse, ApiSuccessResponse } from '@nestora/types';
import { humanizeApiErrorMessage } from '@/lib/api/humanize-error';

export type ParsedApi<T> =
  | { ok: true; data: T; message: string; status: number }
  | { ok: false; message: string; code?: string; status: number };

export async function parseApiResponse<T>(response: Response): Promise<ParsedApi<T>> {
  const status = response.status;
  let body: ApiSuccessResponse<T> | ApiErrorResponse | null = null;
  try {
    body = (await response.json()) as ApiSuccessResponse<T> | ApiErrorResponse;
  } catch {
    if (status === 500 || status === 502 || status === 503 || status === 504) {
      return {
        ok: false,
        status,
        message:
          'Cannot reach the Nestora API. Start it with `pnpm --filter @nestora/api dev` and ensure Neon (or local Postgres) is reachable.',
      };
    }
    return {
      ok: false,
      status,
      message: response.ok ? 'Invalid server response.' : `Request failed (${status}).`,
    };
  }

  if (body && body.success) {
    return { ok: true, status, data: body.data, message: body.message };
  }

  const err = body && !body.success ? body.error : undefined;
  return {
    ok: false,
    status,
    code: err?.code,
    message: humanizeApiErrorMessage(err?.message ?? `Request failed (${status}).`),
  };
}
