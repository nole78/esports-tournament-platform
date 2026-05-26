import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { ILoggerService } from '../../../Domain/services/logger/ILoggerService';
import { DbManager } from '../../connection/DbConnectionPool';
import { CreateUserWatchlistDto } from '../../../Domain/DTOs/user_watchlists/CreateUserWatchlistDto';
import { UserWatchlist } from '../../../Domain/models/UserWatchlist';
import { IUserWatchlistWriteRepository } from '../../../Domain/repositories/user_watchlist/IUserWatchlistWriteRepository';

export class UserWatchlistWriteRepository implements IUserWatchlistWriteRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

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
}