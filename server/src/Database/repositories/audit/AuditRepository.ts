import { RowDataPacket, ResultSetHeader } from "mysql2";
import { IAuditRepository } from "../../../Domain/repositories/audit/IAuditRepository";
import { AuditLog } from "../../../Domain/models/AuditLog";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";

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
        `INSERT INTO audit_log (user_id, action, entity, entity_id, meta, ipAddress)
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

  async findAll(page: number, limit: number): Promise<AuditLog[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    const offset = Math.max(0, Math.floor((page - 1) * limit));
    const lim    = Math.max(1, Math.floor(limit));
    console.log(`LIM: ${lim}, OFFSET: ${offset}`)
    try {
        const [rows] = await res.conn.query<RowDataPacket[]>(
            `SELECT * FROM audit_log
            ORDER BY createdAt DESC
            LIMIT ? OFFSET ?`,
            [lim, offset]
      );
      const items = rows.map(
        (l) => new AuditLog(
          l.id, l.user_id ?? null,
          l.action, l.entity ?? null, l.entity_id ?? null,
          l.meta ?? null,
          l.ipAddress ?? null, new Date(l.createdAt as string)
        )
      );
      return items;
    } catch (err) {
      this.logger.error("AuditRepository", "findAll failed", err);
      return [];
    } finally { res.conn.release(); }
  }

  async getTotal(): Promise<number>
  {
    const res = await this.db.getWriteConnection();
            if (!res) return 0;
        try{
            const [cnt] = await res.conn.execute<RowDataPacket[]>(`SELECT COUNT(*) as total FROM audit_log`);
            return cnt[0]?.total ?? 0;
        }
        catch (err){
            this.logger.error("AuditRepository", "get total failed", err);
            return 0;
        } finally { res.conn.release(); }
  }
}
 