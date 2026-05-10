import type { AuditLogDto } from "../../models/audit/AuditLogDTO";
import type { ApiResponse } from "../../types/audit/AuditApiResponse";
import type { PaginatedList } from "../../models/audit/AuditList";

export interface IAuditLogAPIService {
  getLogs(token: string, page?: number, limit?: number): Promise<ApiResponse<PaginatedList<AuditLogDto>>>;
}
