import { ResultSetHeader, RowDataPacket } from "mysql2";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { DbManager } from "../../connection/DbConnectionPool";
import { CreateTeamDto } from "../../../Domain/DTOs/teams/CreateTeamDto";
import { Team } from "../../../Domain/models/Team";
import { ITeamRepositoryWrite } from "../../../Domain/repositories/teams/ITeamRepositoryWrite";


export class TeamRepositoryWrite implements ITeamRepositoryWrite {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}
  private map(r: RowDataPacket): Team {
    return new Team(r.team_id, r.team_name, r.team_tag, r.team_logotip, r.team_description);
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
    } finally { if(!res.isTransaction)
        res.conn.release();; }
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
      .filter(([, v]) => v);
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
    } finally { if(!res.isTransaction)
        res.conn.release();; }
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
    } finally { if(!res.isTransaction)
        res.conn.release();; }
  }
  
}
