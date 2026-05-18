/**
 * 标准成功响应包裹结构。
 */
export interface ApiSuccessResponse<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * 标准列表数据结构。
 */
export interface ApiListData<T> {
  items: T[];
  total: number;
}

/**
 * 标准分页数据结构。
 */
export interface ApiPaginatedData<T> extends ApiListData<T> {
  page: number;
  pageSize: number;
  totalPages: number;
}
