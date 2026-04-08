import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { UserWatchlistDto } from '../../../Domain/DTOs/user_watchlists/UserWatchlistDto';
import { IUserWatchlistRepository } from '../../../Domain/repositories/user_watchlist/IUserWatchlistRepository';
import { ILoggerService } from '../../../Domain/services/logger/ILoggerService';
import { DbManager } from '../../connection/DbConnectionPool';
import { CreateUserWatchlistDto } from '../../../Domain/DTOs/user_watchlists/CreateUserWatchlistDto';
import { UserWatchlist } from '../../../Domain/models/UserWatchlist';

export class UserWatchlistRepository implements IUserWatchlistRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  private map(r: RowDataPacket): UserWatchlistDto {
    // TODO: imlement
    return new UserWatchlistDto();
  }

  async findAll(page = 1, limit = 20): Promise<UserWatchlistDto[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    const offset = (page - 1) * limit;
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM user_watchlist LIMIT ? OFFSET ?`, [limit, offset]
      );
      return rows.map((r) => this.map(r));
    } catch (err) {
      this.logger.error("UserWatchlistRepository", "findAll failed", err);
      return [];
    } finally { res.conn.release(); }
  }

  async findByUserId(userId: number): Promise<UserWatchlistDto[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM user_watchlist WHERE userId = ? ORDER BY tournament_id`, [userId]
      );
      return rows.map((r) => this.map(r));
    } catch (err) {
      this.logger.error("UserWatchlistRepository", "findByUserId failed", err);
      return [];
    } finally { res.conn.release(); }
  }

  async create(dto: CreateUserWatchlistDto): Promise<UserWatchlist> {
    const res = await this.db.getWriteConnection();
    if (!res) return new UserWatchlist();
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `INSERT INTO user_watchlist (user_id,tournament_id) VALUES (?, ?)`,
        [dto.userId,dto.tournamentId]
      );
      if (result.insertId === 0) return new UserWatchlist();
      return new UserWatchlist(result.insertId, dto.userId,dto.tournamentId);
    } catch (err) {
      this.logger.error("UserWatchlistRepository", "create failed", err);
      return new UserWatchlist();
    } finally { res.conn.release(); }
  }

  async update(userId: number,tournamentId: number , fields: Partial<UserWatchlist>): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const entries = Object.entries(fields).filter(([, v]) => v !== undefined);
      if (entries.length === 0) return false;
      const setClause = entries.map(([k]) => `${k} = ?`).join(", ");
      const values = entries.map(([, v]) => v);
      const [result] = await res.conn.execute<ResultSetHeader>(
        `UPDATE user_watchlist SET ${setClause} WHERE user_id = ? AND tournament_id = ?`, [...values, userId, tournamentId]
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("UserWatchlistRepository", "update failed", err);
      return false;
    } finally { res.conn.release(); }
  }

  async delete(userId: number,tournamentId: number): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `DELETE FROM user_watchlist WHERE user_id = ? AND tournament_id = ?`, [userId, tournamentId]
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("UserWatchlistRepository", "delete failed", err);
      return false;
    } finally { res.conn.release(); }
  }
}