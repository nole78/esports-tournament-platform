// separate 
// move into models
export type PaginatedList<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
// separate file
export type ApiResponse<T> = { success: boolean; message?: string; data?: T };