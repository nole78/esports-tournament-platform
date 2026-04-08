import { ResultSetHeader, RowDataPacket } from "mysql2";
import { IMatchPlayerRepository } from "../../../Domain/repositories/match_players/IMatchPlayerRepository";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { DbManager } from "../../connection/DbConnectionPool";
import { MatchPlayerDto } from '../../../Domain/DTOs/match_players/MatchPlayerDto';
import { CreateMatchPlayerDto } from "../../../Domain/DTOs/match_players/CreateMatchPlayerDto";
import { MatchPlayer } from "../../../Domain/models/MatchPlayer";

export class MatchPlayerRepository implements IMatchPlayerRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  private map(r: RowDataPacket): MatchPlayerDto {
    // TODO: implement
    return new MatchPlayerDto();
  }

  async findByUserId(userId: number): Promise<MatchPlayerDto[]> {
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

  async findByMatchId(matchId: number): Promise<MatchPlayerDto[]>{
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

  async findByTeamId(teamId: number): Promise<MatchPlayerDto[]>{
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


  async findAll(page = 1, limit = 20): Promise<MatchPlayerDto[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    const offset = (page - 1) * limit;
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM entities LIMIT ? OFFSET ?`, [limit, offset]
      );
      return rows.map((r) => this.map(r));
    } catch (err) {
      this.logger.error("MatchPlayerRepository", "findAll failed", err);
      return [];
    } finally { res.conn.release(); }
  }

  async create(dto: CreateMatchPlayerDto): Promise<MatchPlayer> {
    const res = await this.db.getWriteConnection();
    if (!res) return new MatchPlayer();
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `INSERT INTO match_players (user_id,team_id,match_id) VALUES (?, ?, ?)`,
        [dto.userId, dto.teamId, dto.matchId]
      );
      if (result.insertId === 0) return new MatchPlayer();
      return new MatchPlayer(result.insertId, dto.userId, dto.teamId, dto.matchId);
    } catch (err) {
      this.logger.error("MatchPlayerRepository", "create failed", err);
      return new MatchPlayer();
    } finally { res.conn.release(); }
  }

  async update(userId: number, teamId: number, matchId: number, fields: Partial<MatchPlayer>): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const entries = Object.entries(fields).filter(([, v]) => v !== undefined);
      if (entries.length === 0) return false;
      const setClause = entries.map(([k]) => `${k} = ?`).join(", ");
      const values = entries.map(([, v]) => v);
      const [result] = await res.conn.execute<ResultSetHeader>(
        `UPDATE match_players SET ${setClause} WHERE user_id = ? AND team_id = ? AND match_id = =`, [...values, userId, teamId, matchId]
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("MathcPlayerRepository", "update failed", err);
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
      this.logger.error("MathcPlayerRepository", "delete failed", err);
      return false;
    } finally { res.conn.release(); }
  }
}
