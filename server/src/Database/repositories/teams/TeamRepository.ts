import { ResultSetHeader, RowDataPacket } from "mysql2";
import { ITeamRepository } from "../../../Domain/repositories/teams/ITeamRepository";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { DbManager } from "../../connection/DbConnectionPool";
import { TeamDto } from "../../../Domain/DTOs/teams/TeamDto";
import { CreateTeamDto } from "../../../Domain/DTOs/teams/CreateTeamDto";
import { Team } from "../../../Domain/models/Team";

export class TeamRepository implements ITeamRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  private map(r: RowDataPacket): TeamDto {
    return new TeamDto(r.team_id, r.team_name, r.team_tag, r.team_logotip, r.team_description);
  }

  async findById(id: number): Promise<TeamDto | null> {
    const res = await this.db.getReadConnection();
    if (!res) return null;
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(`SELECT * FROM teams WHERE team_id = ?`, [id]);
      return rows.length > 0 ? this.map(rows[0]) : null;
    } catch (err) {
      this.logger.error("TeamRepository", "findById failed", err);
      return null;
    } finally { res.conn.release(); }
  }

  async findAll(page = 1, limit = 20): Promise<TeamDto[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    const offset = (page - 1) * limit;
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM teams ORDER BY team_id DESC LIMIT ? OFFSET ?`, [limit, offset]
      );
      return rows.map((r) => this.map(r));
    } catch (err) {
      this.logger.error("TeamRepository", "findAll failed", err);
      return [];
    } finally { res.conn.release(); }
  }

  async create(dto: CreateTeamDto): Promise<Team> {
    const res = await this.db.getWriteConnection();
    if (!res) return new Team();
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `INSERT INTO teams (team_name, team_tag, team_logotip, team_description) VALUES (?, ?, ?, ?)`,
        [dto.teamName, dto.teamTag, dto.teamLogotip, dto.teamDescription]
      );
      if (result.insertId === 0) return new Team();
      return new Team(result.insertId, dto.teamName, dto.teamTag, dto.teamLogotip, dto.teamDescription);
    } catch (err) {
      this.logger.error("TeamRepository", "create failed", err);
      return new Team();
    } finally { res.conn.release(); }
  }

  async update(id: number, fields: Partial<Team>): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;

    const fieldMap: Record<string, string> ={
      teamName: "team_name",
      teamTag: "team_tag",
      teamLogotip: "team_logotip",
      teamDescription: "team_descrition"
    }

    try {
      const entries = Object.entries(fields)
      .filter(([, v]) => v !== undefined)
      .map(([k,v])=>[fieldMap[k] ?? k, v]);
      if (entries.length === 0) return false;
      const setClause = entries.map(([k]) => `${k} = ?`).join(", ");
      const values = entries.map(([, v]) => v);
      const [result] = await res.conn.execute<ResultSetHeader>(
        `UPDATE teams SET ${setClause} WHERE team_id = ?`, [...values, id]
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("TeamRepository", "update failed", err);
      return false;
    } finally { res.conn.release(); }
  }

  async delete(id: number): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `DELETE FROM teams WHERE team_id = ?`, [id]
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("TeamRepository", "delete failed", err);
      return false;
    } finally { res.conn.release(); }
  }
}