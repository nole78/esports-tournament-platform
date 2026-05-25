import type { AuditLogDto } from "../../models/audit/AuditLogDTO";
import type { ApiResponse } from "../../types/api/ApiResponse";
import type { PaginatedList } from "../../models/audit/AuditList";

export interface IAuditLogAPIService {
  getLogs(page?: number, limit?: number): Promise<ApiResponse<PaginatedList<AuditLogDto>>>;
}
