import { Result } from "../../common/Result";
import { AuditLogDto } from "../../DTOs/audit/AuditLogDto";
import { PaginatedListDto } from "../../DTOs/PaginatedListDto";

export type AuditMeta = Record<string, string | number | boolean>;

export interface IAuditService {
  log(params: {
    userId?: number;
    action: string;
    entity?: string;
    entityId?: number;
    meta?: AuditMeta;
    ipAddress?: string;
  }): Promise<void>;
  getAllLogs(page: number, limit: number): Promise<Result<PaginatedListDto<AuditLogDto>>>;
}