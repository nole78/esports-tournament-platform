import { ResultSetHeader, RowDataPacket } from "mysql2";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { DbManager } from "../../connection/DbConnectionPool";
import { Team } from "../../../Domain/models/Team";
import { ITeamRepositoryRead } from "../../../Domain/repositories/teams/ITeamRepositoryRead";


export class TeamRepositoryRead implements ITeamRepositoryRead {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}
  private map(r: RowDataPacket): Team {
    return new Team(r.team_id, r.team_name, r.team_tag, r.team_logotip, r.team_description);
    }

  async findById(id: number): Promise<Team> {
    const res = await this.db.getReadConnection();
    if (!res) return new Team();
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT t.team_id, t.team_name, t.team_tag, t.team_logotip, t.team_description 
        FROM teams t WHERE t.team_id = ?`, [id]
      );

      return rows.length > 0 ? this.map(rows[0]) : new Team();
    } catch (err) {
      this.logger.error("TeamRepository", "findById failed", err);
      return new Team();
    } finally { res.conn.release(); }
  }

  async findAll(page = 1, limit = 20): Promise<Team[]> {
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

  async findByTeamTag(TeamTag: string): Promise<Team> {
    const res = await this.db.getReadConnection();
    if (!res) return new Team;
    try {
      const [rows] = await res.conn.query<RowDataPacket[]>(
        `SELECT * FROM teams WHERE team_tag = ? `, [TeamTag] 
      );
      return rows.length > 0 ? this.map(rows[0]) : new Team;
    } catch (err) {
      this.logger.error("TeamRepository", "findByTeamTag failed", err);
      return new Team;
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
