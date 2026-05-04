import { ResultSetHeader, RowDataPacket } from "mysql2";
import { ITeamMemberRepository } from "../../../Domain/repositories/team_members/ITeamMemberRepository";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { DbManager } from "../../connection/DbConnectionPool";
import { TeamMemberDto } from "../../../Domain/DTOs/team_members/TeamMemberDto";
import { CreateTeamMemberDto } from "../../../Domain/DTOs/team_members/CreateTeamMemberDto";
import { TeamMember } from "../../../Domain/models/TeamMember";

export class TeamMemberRepository implements ITeamMemberRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  private map(r: RowDataPacket): TeamMemberDto {
    return new TeamMemberDto(r.team_id, r.user_id, r.role);
  }

  async findAll(page = 1, limit = 20): Promise<TeamMemberDto[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    const offset = (page - 1) * limit;
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM team_members LIMIT ? OFFSET ?`, [limit, offset]
      );
      return rows.map((r) => this.map(r));
    } catch (err) {
      this.logger.error("TeamMemberRepository", "findAll failed", err);
      return [];
    } finally { res.conn.release(); }
  }

  async findByUserId(userId: number): Promise<TeamMemberDto[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM team_members WHERE user_id = ? ORDER BY team_id DESC`, [userId]
      );
      return rows.map((r) => this.map(r));
    } catch (err) {
      this.logger.error("TeamMemberRepository", "findByUserId failed", err);
      return [];
    } finally { res.conn.release(); }
  }

   async findByTeamId(teamId: number): Promise<TeamMemberDto[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM team_members WHERE team_id = ? ORDER BY user_id DESC`, [teamId]
      );
      return rows.map((r) => this.map(r));
    } catch (err) {
      this.logger.error("TeamMemberRepository", "findByTeamId failed", err);
      return [];
    } finally { res.conn.release(); }
  }

  async create(dto: TeamMemberDto): Promise<TeamMember> {
    const res = await this.db.getWriteConnection();
    if (!res) return new TeamMember();
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `INSERT INTO team_members (team_id,user_id,role) VALUES (?, ?, ?)`,
        [dto.teamId, dto.userId, dto.role]
      );
      if (result.insertId === 0) return new TeamMember();
      return new TeamMember(dto.teamId, dto.userId, dto.role);
    } catch (err) {
      this.logger.error("TeamMemberRepository", "create failed", err);
      return new TeamMember();
    } finally { res.conn.release(); }
  }

  async update(teamId: number, userId: number, fields: Partial<TeamMember>): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    //Will leave as is, maybe the role should update
    const fieldMap: Record<string, string> ={

    }
    try {
      const entries = Object.entries(fields).filter(([, v]) => v !== undefined);
      if (entries.length === 0) return false;
      const setClause = entries.map(([k]) => `${k} = ?`).join(", ");
      const values = entries.map(([, v]) => v);
      const [result] = await res.conn.execute<ResultSetHeader>(
        `UPDATE team_members SET ${setClause} WHERE team_id = ? AND user_id = ?`, [...values, teamId, userId]
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
