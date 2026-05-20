import { ResultSetHeader, RowDataPacket } from 'mysql2';
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

  private map(r: RowDataPacket): UserWatchlist {
    return new UserWatchlist(r.user_id, r.tournament_id, r.added_at);
  }

  async findByUserId(userId: number, page = 1, limit = 20): Promise<UserWatchlist[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    const offset = (page - 1) * limit;
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM user_watchlist WHERE userId = ? ORDER BY tournament_id LIMIT ? OFFSET ?`, [userId, limit, offset]
      );
      const items = rows.map((r) => this.map(r));
      return items;

    } catch (err) {
      this.logger.error("UserWatchlistRepository", "findByUserId failed", err);
      return [];
    } finally { res.conn.release(); }
  }

  async findWatchlistItem(userId: number, tournamentId: number): Promise<UserWatchlist>{
    const res = await this.db.getReadConnection();
    if (!res) return new UserWatchlist();
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM user_watchlist WHERE user_id = ? AND tournament_id = ?`, [userId, tournamentId]
      );
      return rows.length > 0 ? this.map(rows[0]) : new UserWatchlist;
    } catch (err) {
      this.logger.error("UserWatchlistRepository", "findWatchlistItem failed", err);
      return new UserWatchlist();
    } finally { res.conn.release(); }
  }

  async create(dto: CreateUserWatchlistDto): Promise<UserWatchlist> {
    const res = await this.db.getWriteConnection();
    if (!res) return new UserWatchlist();
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `INSERT INTO user_watchlist (user_id, tournament_id, added_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
        [dto.userId,dto.tournamentId]
      );
      if (result.insertId === 0) return new UserWatchlist();
      return new UserWatchlist(dto.userId,dto.tournamentId, new Date());
    } catch (err) {
      this.logger.error("UserWatchlistRepository", "create failed", err);
      return new UserWatchlist();
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

  async getTotal(userId: number): Promise<number> {
        const res = await this.db.getWriteConnection();
            if (!res) return 0;
        try{
            const [cnt] = await res.conn.execute<RowDataPacket[]>(
              `SELECT COUNT(*) as total FROM user_watchlist where user_id = ?`,[userId]
            );
            return cnt[0]?.total ?? 0;
        }
        catch (err){
            this.logger.error("UserWatchlistRepository", "get total failed", err);
            return 0;
        } finally { res.conn.release(); }
    }
}