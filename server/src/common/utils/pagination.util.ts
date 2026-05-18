import {
  ApiListData,
  ApiPaginatedData,
} from '../interfaces/api-response.interface';

/**
 * 创建列表结构结果，适用于不带页码的简单集合返回。
 */
export function createListResult<T>(
  items: T[],
  total = items.length,
): ApiListData<T> {
  return {
    items,
    total,
  };
}

/**
 * 创建标准分页结构结果，统一输出总数、页码和总页数。
 */
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
