import type { ApiPaginationMeta } from '@nestora/types';
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } from '../constants/limits.js';

export type PaginationMeta = ApiPaginationMeta;

export type NormalizedPagination = {
  page: number;
  limit: number;
  skip: number;
};

export function clampPageLimit(limit: number): number {
  if (!Number.isFinite(limit) || limit <= 0) {
    return DEFAULT_PAGE_LIMIT;
  }
  return Math.min(Math.floor(limit), MAX_PAGE_LIMIT);
}

export function normalizePagination(page: number, limit: number): NormalizedPagination {
  const safeLimit = clampPageLimit(limit);
  const safePage =
    !Number.isFinite(page) || page < 1 ? DEFAULT_PAGE : Math.max(1, Math.floor(page));
  const skip = (safePage - 1) * safeLimit;
  return { page: safePage, limit: safeLimit, skip };
}

export function buildPaginationMeta(
  page: number,
  limit: number,
  totalRecords: number,
): PaginationMeta {
  const safeTotal = Math.max(0, Math.floor(totalRecords));
  const total_pages = safeTotal === 0 ? 0 : Math.ceil(safeTotal / limit);
  return {
    page,
    limit,
    total_records: safeTotal,
    total_pages,
  };
}
