import { ResultSetHeader, RowDataPacket } from "mysql2";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { DbManager } from "../../connection/DbConnectionPool";
import { MatchPlayer } from "../../../Domain/models/MatchPlayer";
import { IMatchPlayerWriteRepository } from "../../../Domain/repositories/match_players/IMatchPlayerWriteRepository";

export class MatchPlayerWriteRepository implements IMatchPlayerWriteRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  async create(matchPlayer: MatchPlayer): Promise<MatchPlayer> {
    const res = await this.db.getWriteConnection();
    if (!res) return new MatchPlayer();
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `INSERT INTO match_players (user_id, team_id, match_id) VALUES (?, ?, ?)`,
        [matchPlayer.userId, matchPlayer.teamId, matchPlayer.matchId]
      );
      if (result.insertId === 0) return new MatchPlayer();
      return matchPlayer;
    } catch (err) {
      this.logger.error("MatchPlayerRepository", "create failed", err);
      return new MatchPlayer();
    } finally { res.conn.release(); }
  }

  async update(userId: number, teamId: number, matchId: number, fields: Partial<MatchPlayer>): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;

    const fieldMap: Record<string, string> = {
        matchId: "match_id",
        teamId: "team_id",
        userId: "user_id",
        performanceNotes: "performance_notes"
    }

    try {
      const entries = Object.entries(fields)
        .filter(([, v]) => v !== undefined)
        .map(([k,v]) => [fieldMap[k] ?? k, v]);

      if (entries.length === 0) return false;
      const setClause = entries.map(([k]) => `${k} = ?`).join(", ");
      const values = entries.map(([, v]) => v);
      const [result] = await res.conn.execute<ResultSetHeader>(
        `UPDATE match_players SET ${setClause} WHERE user_id = ? AND team_id = ? AND match_id = ?`, [...values, userId, teamId, matchId]
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("MatchPlayerRepository", "update failed", err);
      return false;
    } finally { res.conn.release(); }
  }

  async delete(userId: number, teamId: number, matchId: number): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `DELETE FROM match_players WHERE user_id = ? AND team_id = ? AND match_id = ?`, [userId, teamId, matchId]
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("MatchPlayerRepository", "delete failed", err);
      return false;
    } finally { res.conn.release(); }
  }
}
