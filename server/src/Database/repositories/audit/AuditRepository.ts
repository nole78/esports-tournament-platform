import { RowDataPacket, ResultSetHeader } from "mysql2";
import { IAuditRepository } from "../../../Domain/repositories/audit/IAuditRepository";
import { AuditLog } from "../../../Domain/models/AuditLog";
import { AuditLogDto } from "../../../Domain/DTOs/audit/AuditLogDto";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { PaginatedListDto } from "../../../Domain/DTOs/PaginatedListDto";

export class AuditRepository implements IAuditRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService
  ) {}

  async create(log: AuditLog): Promise<AuditLog> {
    const res = await this.db.getWriteConnection();
    if (!res) return new AuditLog();
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `INSERT INTO audit_log (user_id, action, entity, entityId, meta, ipAddress)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [log.userId ?? null, log.action, log.entity ?? null,
         log.entityId ?? null, log.meta ?? null, log.ipAddress ?? null]
      );
      if (result.insertId === 0) return new AuditLog();
      return new AuditLog(result.insertId, log.userId, log.action,
        log.entity, log.entityId, log.meta, log.ipAddress);
    } catch (err) {
      this.logger.error("AuditRepository", "create failed", err);
      return new AuditLog();
    } finally { res.conn.release(); }
  }

  async findAll(page: number, limit: number): Promise<PaginatedListDto<AuditLogDto>> {
    const res = await this.db.getReadConnection();
    if (!res) return new PaginatedListDto([], 0, page, limit);
    const offset = Math.max(0, Math.floor((page - 1) * limit));
    const lim    = Math.max(1, Math.floor(limit));
    try {
        // TODO: improve querry - remove JOIN
        const [rows] = await res.conn.execute<RowDataPacket[]>(
            `SELECT al.*, u.username
            FROM audit_log al
            LEFT JOIN users u ON al.user_id = u.id
            ORDER BY al.createdAt DESC
            LIMIT ${lim} OFFSET ${offset}`,
            []
      );
      const [cnt] = await res.conn.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM audit_log`
      );
      const items = rows.map(
        (l) => new AuditLogDto(
          l.id, l.userId ?? null, l.username ?? null,
          l.action, l.entity ?? null, l.entityId ?? null,
          l.meta ? (JSON.parse(l.meta as string) as Record<string, unknown>) : null,
          l.ipAddress ?? null, new Date(l.createdAt as string)
        )
      );
      return new PaginatedListDto(items, cnt[0]?.total ?? 0, page, limit);
    } catch (err) {
      this.logger.error("AuditRepository", "findAll failed", err);
      return new PaginatedListDto([], 0, page, limit);
    } finally { res.conn.release(); }
  }
}