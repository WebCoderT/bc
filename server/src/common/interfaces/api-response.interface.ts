export interface ApiSuccessResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface ApiListData<T> {
  items: T[];
  total: number;
}

export interface ApiPaginatedData<T> extends ApiListData<T> {
  page: number;
  pageSize: number;
  totalPages: number;
}
