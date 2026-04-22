import type { AuditLogDto } from "../../models/audit/AuditLogDTO";
import type { ApiResponse, PaginatedList } from "../../types/audit/AuditList";

export interface IAuditLogAPIService {
  getLogs(token: string, page?: number, limit?: number): Promise<ApiResponse<PaginatedList<AuditLogDto>>>;
}
