export type PaginatedList<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};