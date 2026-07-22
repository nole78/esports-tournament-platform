import { RowDataPacket, ResultSetHeader } from "mysql2";
import { TeamMember } from "../../../Domain/models/TeamMember";
import { ITeamMemberRepositoryRead } from "../../../Domain/repositories/team_members/ITeamMemberRepositoryRead";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { DbManager } from "../../connection/DbConnectionPool";

export class TeamMemberRepositoryRead implements ITeamMemberRepositoryRead{
    public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  private map(r: RowDataPacket): TeamMember {
    return new TeamMember(r.team_id, r.user_id, r.role, r.joined_at);
  }

  async findAll(page = 1, limit = 20): Promise<TeamMember[]> {
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
    } finally { if(!res.isTransaction)
        res.conn.release();; }
  }

  async findByUserId(userId: number): Promise<TeamMember[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM team_members WHERE user_id = ? ORDER BY user_id DESC`, [userId]
      );
      return rows.map((r) => this.map(r));
    } catch (err) {
      this.logger.error("TeamMemberRepository", "findByUserId failed", err);
      return [];
    } finally { if(!res.isTransaction)
        res.conn.release();; }
  }

   async findByTeamId(teamId: number): Promise<TeamMember[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM team_members WHERE team_id = ? ORDER BY team_id DESC`, [teamId]
      );
      return rows.map((r) => this.map(r));
    } catch (err) {
      this.logger.error("TeamMemberRepository", "findByTeamId failed", err);
      return [];
    } finally { if(!res.isTransaction)
        res.conn.release();; }
  }
}