import { RowDataPacket, ResultSetHeader } from "mysql2";
import { TeamRole } from "../../../Domain/enums/TeamRole";
import { TeamMember } from "../../../Domain/models/TeamMember";
import { ITeamMemberRepositoryWrite } from "../../../Domain/repositories/team_members/ITeamMemberRepositoryWrite";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { DbManager } from "../../connection/DbConnectionPool";

export class TeamMemberRepositoryWrite implements ITeamMemberRepositoryWrite{
    public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  private map(r: RowDataPacket): TeamMember {
    return new TeamMember(r.team_id, r.user_id, r.role, r.joined_at);
  }

  async create(dto: TeamMember): Promise<TeamMember> {
    const res = await this.db.getWriteConnection();
    if (!res) return new TeamMember();
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `INSERT INTO team_members (team_id,user_id,role) VALUES (?, ?, ?)`,
        [dto.teamId, dto.userId, dto.role]
      );
      
      if (result.affectedRows === 0) return new TeamMember();
      return new TeamMember(dto.teamId, dto.userId, dto.role);
    } catch (err) {
      this.logger.error("TeamMemberRepository", "create failed", err);
      return new TeamMember();
    } finally { res.conn.release(); }
  }

  async update(teamId: number, userId: number, role: TeamRole): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      // const entries = Object.entries(fields).filter(([, v]) => v !== undefined);
      // if (entries.length === 0) return false;
      // const setClause = entries.map(([k]) => `${k} = ?`).join(", ");
      // const values = entries.map(([, v]) => v);
      const [result] = await res.conn.execute<ResultSetHeader>(
        `UPDATE team_members SET role = ? WHERE team_id = ? AND user_id = ?`, [role, teamId, userId]
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("TeamMemberRepository", "update failed", err);
      return false;
    } finally { res.conn.release(); }
  }

  async delete(teamId: number, userId: number): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `DELETE FROM team_members WHERE team_id = ? AND user_id = ?`, [teamId, userId]
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("TeamMemberRepository", "delete failed", err);
      return false;
    } finally { res.conn.release(); }
  }
}