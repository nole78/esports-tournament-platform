import { IAuditService } from "../../Domain/services/audit/IAuditService";
import { IAuditRepository } from "../../Domain/repositories/audit/IAuditRepository";
import { AuditLogDto } from "../../Domain/DTOs/audit/AuditLogDto";
import { PaginatedListDto } from "../../Domain/DTOs/PaginatedListDto";
import { AuditLog } from "../../Domain/models/AuditLog";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";

export class AuditService implements IAuditService {
  public constructor(private readonly auditRepo: IAuditRepository, private readonly userRepo: IUserRepository) {}

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
      params.userId ?? null,
      params.action,
      params.entity ?? null,
      params.entityId ?? null,
      params.meta ? JSON.stringify(params.meta) : null,
      params.ipAddress ?? null
    );
    await this.auditRepo.create(entry);
  }

  async getAllLogs(page: number, limit: number): Promise<PaginatedListDto<AuditLogDto>> {
    let auditLogs = await this.auditRepo.findAll(page, limit);
    for (const log of auditLogs.items) {
      const user = await this.userRepo.findById(log.userId || 0);
      log.gamer_tag = user ? user.gamerTag : "";
    }
    return auditLogs;
  }
}