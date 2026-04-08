import { AuditLogDto } from "../../DTOs/audit/AuditLogDto";
import { PaginatedListDto } from "../../DTOs/PaginatedListDto";
import { AuditLog } from "../../models/AuditLog";

export interface IAuditRepository {
  create(log: AuditLog): Promise<AuditLog>;
  findAll(page: number, limit: number): Promise<PaginatedListDto<AuditLogDto>>;
}