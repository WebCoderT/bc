import {
  ApiListData,
  ApiPaginatedData,
} from '../interfaces/api-response.interface';

export function createListResult<T>(
  items: T[],
  total = items.length,
): ApiListData<T> {
  return {
    items,
    total,
  };
}

export function createPaginatedResult<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
): ApiPaginatedData<T> {
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
