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

  async findById(id: number): Promise<TeamDto> {
    const res = await this.db.getReadConnection();
    if (!res) return new TeamDto();
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT t.team_id, t.team_name, t.team_tag, t.team_logotip, t.team_description 
        FROM teams t WHERE t.team_id = ?`, [id]
      );

      return rows.length > 0 ? this.map(rows[0]) : new TeamDto();
    } catch (err) {
      this.logger.error("TeamRepository", "findById failed", err);
      return new TeamDto();
    } finally { res.conn.release(); }
  }

  async findAll(page = 1, limit = 20): Promise<TeamDto[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    const offset = (page - 1) * limit;
    try {
      const [rows] = await res.conn.query<RowDataPacket[]>(
        `SELECT t.team_id, t.team_name, t.team_tag, t.team_logotip, t.team_description 
        FROM teams t ORDER BY t.team_id
         LIMIT ? OFFSET ?`, [limit, offset]
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
      teamDescription: "team_description"
    }

    try {
      const providedEntries = Object.entries(fields)
      .filter(([, v]) => v !== undefined);
      if (providedEntries.length === 0) return false;

      const hasUnknownFields = providedEntries.some(([k]) => !(k in fieldMap));
      if (hasUnknownFields) return false;

      const entries = providedEntries.map(([k, v])=> [fieldMap[k], v] as const);
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
  async findByTeamTag(TeamTag: string): Promise<TeamDto> {
    const res = await this.db.getReadConnection();
    if (!res) return new TeamDto;
    try {
      const [rows] = await res.conn.query<RowDataPacket[]>(
        `SELECT * FROM teams WHERE team_tag = ? `, [TeamTag] 
      );
      return rows.length > 0 ? this.map(rows[0]) : new TeamDto;
    } catch (err) {
      this.logger.error("TeamRepository", "findByTeamTag failed", err);
      return new TeamDto;
    } finally { res.conn.release(); }
  }
  async getTotal(): Promise<number>{
    const res = await this.db.getReadConnection();
    if (!res) return 0;

    try{
      const [cnt] = await res.conn.execute<RowDataPacket[]>(`SELECT COUNT(*) as total FROM teams`);
      return cnt[0]?.total ?? 0;
    }
    catch (err){
      this.logger.error("TeamRepository", "get total failed", err);
      return 0;
    } finally {res.conn.release();}
  }
}
