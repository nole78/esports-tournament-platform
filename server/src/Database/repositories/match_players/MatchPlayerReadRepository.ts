import { ResultSetHeader, RowDataPacket } from "mysql2";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { DbManager } from "../../connection/DbConnectionPool";
import { MatchPlayer } from "../../../Domain/models/MatchPlayer";
import { IMatchPlayerReadRepository } from "../../../Domain/repositories/match_players/IMatchPlayerReadRepository";

export class MatchPlayerReadRepository implements IMatchPlayerReadRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  private map(r: RowDataPacket): MatchPlayer {
    return new MatchPlayer(r.user_id, r.team_id, r.match_id, r.performance_notes);
  }
  
  async findOne(userId: number, matchId: number): Promise<MatchPlayer> {
    const res = await this.db.getReadConnection();
    if (!res) return new MatchPlayer;
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM match_players WHERE user_id = ? AND match_id = ? LIMIT 1`, [userId, matchId]
      );
      return rows.length > 0 ? this.map(rows[0]) : new MatchPlayer;
    } catch (err) {
      this.logger.error("MatchPlayerRepository", "findOne failed", err);
      return new MatchPlayer;
    } finally { res.conn.release(); }
  }

  async findByUserId(userId: number): Promise<MatchPlayer[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM match_players WHERE user_id = ? ORDER BY team_id`, [userId]
      );
      return rows.map((r) => this.map(r));
    } catch (err) {
      this.logger.error("MatchPlayerRepository", "findByUserId failed", err);
      return [];
    } finally { res.conn.release(); }
  }

  async findByMatchId(matchId: number): Promise<MatchPlayer[]>{
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM match_players WHERE match_id = ? ORDER BY user_id`, [matchId]
      );
      return rows.map((r) => this.map(r));
    } catch (err) {
      this.logger.error("MatchPlayerRepository", "findByMatchId failed", err);
      return [];
    } finally { res.conn.release(); }
  }

  async findByTeamId(teamId: number): Promise<MatchPlayer[]>{
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM match_players WHERE team_id = ? ORDER BY user_id`, [teamId]
      );
      return rows.map((r) => this.map(r));
    } catch (err) {
      this.logger.error("MatchPlayerRepository", "findByMatchId failed", err);
      return [];
    } finally { res.conn.release(); }
  }


  async findAll(page = 1, limit = 20): Promise<MatchPlayer[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    const offset = (page - 1) * limit;
    try {
      const [rows] = await res.conn.query<RowDataPacket[]>(
        `SELECT * FROM entities LIMIT ? OFFSET ?`, [limit, offset]
      );
      return rows.map((r) => this.map(r));
    } catch (err) {
      this.logger.error("MatchPlayerRepository", "findAll failed", err);
      return [];
    } finally { res.conn.release(); }
  }
}
