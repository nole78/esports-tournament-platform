import { IAuditService } from "../../Domain/services/audit/IAuditService";
import { IAuditRepository } from "../../Domain/repositories/audit/IAuditRepository";
import { AuditLogDto } from "../../Domain/DTOs/audit/AuditLogDto";
import { PaginatedListDto } from "../../Domain/DTOs/PaginatedListDto";
import { AuditLog } from "../../Domain/models/AuditLog";
import { IUserReadRepository } from "../../Domain/repositories/users/IUserReadRepository";
import { Result } from "../../Domain/common/Result";

export class AuditService implements IAuditService {
  public constructor(
    private readonly auditRepo: IAuditRepository, 
    private readonly userReadRepo: IUserReadRepository
  ) {}

  async log(params: {
    userId?: number;
    action: string;
    entity?: string;
    entityId?: number;
    meta?: Record<string, unknown>;
    ipAddress?: string;
  }): Promise<void> {
    const entry = new AuditLog(
      0,
      params.userId ?? 0,
      params.action,
      params.entity ?? "",
      params.entityId ?? 0,
      params.meta ? JSON.stringify(params.meta) : "",
      params.ipAddress ?? ""
    );
    await this.auditRepo.create(entry);
  }

  async getAllLogs(page: number, limit: number): Promise<Result<PaginatedListDto<AuditLogDto>>> {
    let auditLogs = await this.auditRepo.findAll(page, limit);
    if(!auditLogs[0]) return Result.Success(new PaginatedListDto([], 0, page, limit));
    let total = await this.auditRepo.getTotal();
    const DTOs = auditLogs.map(
      (l) => new AuditLogDto(
          l.id, l.userId ?? 0, "",
          l.action, l.entity ?? "", l.entityId ?? 0,
          l.meta ? (JSON.parse(l.meta as string) as Record<string, unknown>) : {},
          l.ipAddress ?? "", l.createdAt ?? new Date()
      )
    );
    for (const log of DTOs) {
      const user = await this.userReadRepo.findById(log.userId || 0);
      log.gamer_tag = user ? user.gamerTag : "";
    }
    return Result.Success(new PaginatedListDto(DTOs, total, page, limit));
  }
}