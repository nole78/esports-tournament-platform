import { ResultSetHeader, RowDataPacket } from "mysql2";
import { IMatchRepository } from "../../../Domain/repositories/matches/IMatchRepository";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { DbManager } from "../../connection/DbConnectionPool";
import { MatchDto } from "../../../Domain/DTOs/matches/MatchDto";
import { CreateMatchDto } from "../../../Domain/DTOs/matches/CreateMatchDto";
import { Match } from "../../../Domain/models/Match";

export class MatchRepository implements IMatchRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  private map(r: RowDataPacket): MatchDto {
    // Todo: implement
    return new MatchDto();
  }

  async findById(id: number): Promise<MatchDto | null> {
    const res = await this.db.getReadConnection();
    if (!res) return null;
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(`SELECT * FROM matches WHERE match_id = ?`, [id]);
      return rows.length > 0 ? this.map(rows[0]) : null;
    } catch (err) {
      this.logger.error("MatchRepository", "findById failed", err);
      return null;
    } finally { res.conn.release(); }
  }

  async findAll(page = 1, limit = 20): Promise<MatchDto[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    const offset = (page - 1) * limit;
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM matches ORDER BY match_id DESC LIMIT ? OFFSET ?`, [limit, offset]
      );
      return rows.map((r) => this.map(r));
    } catch (err) {
      this.logger.error("MatchRepository", "findAll failed", err);
      return [];
    } finally { res.conn.release(); }
  }

  async findByTeamId(teamId: number): Promise<MatchDto[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM matches WHERE blue_team_id = ? OR red_team_id = ? ORDER BY id DESC`, [teamId,teamId]
      );
      return rows.map((r) => this.map(r));
    } catch (err) {
      this.logger.error("MatchRepository", "findByUserId failed", err);
      return [];
    } finally { res.conn.release(); }
  }

  async create(dto: CreateMatchDto): Promise<Match> {
    const res = await this.db.getWriteConnection();
    if (!res) return new Match();
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `INSERT INTO matches (match_id) VALUES (?)`,
        [dto.matchId]
      );
      if (result.insertId === 0) return new Match();
      return new Match(result.insertId, dto.matchId);
    } catch (err) {
      this.logger.error("MatchRepository", "create failed", err);
      return new Match();
    } finally { res.conn.release(); }
  }

  async update(id: number, fields: Partial<Match>): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const entries = Object.entries(fields).filter(([, v]) => v !== undefined);
      if (entries.length === 0) return false;
      const setClause = entries.map(([k]) => `${k} = ?`).join(", ");
      const values = entries.map(([, v]) => v);
      const [result] = await res.conn.execute<ResultSetHeader>(
        `UPDATE matches SET ${setClause} WHERE match_id = ?`, [...values, id]
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("MatchRepository", "update failed", err);
      return false;
    } finally { res.conn.release(); }
  }

  async delete(id: number): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `DELETE FROM matches WHERE match_id = ?`, [id]
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("EntityRepository", "delete failed", err);
      return false;
    } finally { res.conn.release(); }
  }
}