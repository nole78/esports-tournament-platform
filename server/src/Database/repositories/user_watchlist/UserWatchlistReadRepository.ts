import { RowDataPacket } from 'mysql2';
import { IUserWatchlistReadRepository } from '../../../Domain/repositories/user_watchlist/IUserWatchlistReadRepository';
import { ILoggerService } from '../../../Domain/services/logger/ILoggerService';
import { DbManager } from '../../connection/DbConnectionPool';
import { UserWatchlist } from '../../../Domain/models/UserWatchlist';

export class UserWatchlistReadRepository implements IUserWatchlistReadRepository {
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
      const [rows] = await res.conn.query<RowDataPacket[]>(
        `SELECT * FROM user_watchlist WHERE user_id = ? ORDER BY tournament_id LIMIT ? OFFSET ?`, [userId, limit, offset]
      );
      const items = rows.map((r) => this.map(r));
      return items;

    } catch (err) {
      this.logger.error("UserWatchlistRepository", "findByUserId failed", err);
      return [];
    } finally { if(!res.isTransaction)
        res.conn.release();; }
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
    } finally { if(!res.isTransaction)
        res.conn.release();; }
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
        } finally { if(!res.isTransaction)
        res.conn.release();; }
    }
}