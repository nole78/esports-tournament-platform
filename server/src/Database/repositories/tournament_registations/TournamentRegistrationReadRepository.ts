import { RowDataPacket } from "mysql2";
import { ITournamentRegistrationReadRepository } from "../../../Domain/repositories/tournament_registrations/ITournamentRegistrationReadRepository";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { DbManager } from "../../connection/DbConnectionPool";
import { TournamentRegistration } from "../../../Domain/models/TournamentRegistration";
import { TournamentRegistrationStatus } from "../../../Domain/enums/TournamentRegistrationStatus";

export class TournamentRegistrationReadRepository implements ITournamentRegistrationReadRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  private map(r: RowDataPacket): TournamentRegistration {
    return new TournamentRegistration(r.team_id, r.tournament_id, r.seed, r.status, r.registered_at);
  }

  async findTotalByTeamId(teamId: number): Promise<number>{
    const res = await this.db.getReadConnection();
    if(!res) return 0;
    try{
      const [cnt] = await res.conn.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM tournament_registrations 
        WHERE team_id = ?`,[teamId]
      );

      return cnt[0]?.total ?? 0;
    } catch (err) {
      this.logger.error("TournamentRegistrationRepository", "findTotalByTeamId failed", err);
      return 0;
    } finally { res.conn.release(); }
  }

  async findTotalByTournamentId(tournamentId: number, status:TournamentRegistrationStatus): Promise<number>{
    const res = await this.db.getReadConnection();
    if(!res) return 0;
    const statusClause = status ? "AND status = ?" : "";
    try{
      const [cnt] = await res.conn.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM tournament_registrations 
        WHERE tournament_id = ? ${statusClause}`,[tournamentId, ...(status ? [status] : [])]
      );

      return cnt[0]?.total ?? 0;
    } catch (err) {
      this.logger.error("TournamentRegistrationRepository", "findTotalByTournamentId failed", err);
      return 0;
    } finally { res.conn.release(); }
  }

  async findByTeamId(teamId: number, page = 1, limit = 9): Promise<TournamentRegistration[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    const offset = Math.max(0, Math.floor((page - 1) * limit));
    const lim    = Math.max(1, Math.floor(limit));
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * 
        FROM tournament_registrations 
        WHERE team_id = ? 
        ORDER BY tournament_id DESC LIMIT ? OFFSET ?`, [teamId, lim, offset]
      );
      return rows.map((r) => this.map(r));
    } catch (err) {
      this.logger.error("TournamentRegistrationRepository", "findByTeamId failed", err);
      return [];
    } finally { res.conn.release(); }
  }

  async findByTournamentId(tournamentId: number, status?:TournamentRegistrationStatus, page = 1, limit=9): Promise<TournamentRegistration[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    const offset = Math.max(0, Math.floor((page - 1) * limit));
    const lim    = Math.max(1, Math.floor(limit));
    const statusClause = status ? "AND status = ?" : "";
    try {
      const [rows] = await res.conn.query<RowDataPacket[]>(
        `SELECT * 
        FROM tournament_registrations 
        WHERE tournament_id = ? ${statusClause}
        ORDER BY team_id DESC LIMIT ? OFFSET ?`, [tournamentId, ...(status ? [status] : []), lim, offset]
      );
      return rows.map((r) => this.map(r));
    } catch (err) {
      this.logger.error("TournamentRegistrationRepository", "findByTournamentId failed", err);
      return [];
    } finally { res.conn.release(); }
  }

  async findAllByTournamentId(tournamentId: number, status?: TournamentRegistrationStatus): Promise<TournamentRegistration[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    const statusClause = status ? "AND status = ?" : "";
    try {
      const [rows] = await res.conn.query<RowDataPacket[]>(
        `SELECT * 
        FROM tournament_registrations 
        WHERE tournament_id = ? ${statusClause}
        ORDER BY registered_at ASC`, 
        [tournamentId, ...(status ? [status] : [])]
      );
      return rows.map((r) => this.map(r));
    } catch (err) {
      this.logger.error("TournamentRegistrationRepository", "findAllByTournamentId failed", err);
      return [];
    } finally { res.conn.release(); }
  }

  async findByTournamentAndTeamId(tournamentId: number, teamId: number): Promise<TournamentRegistration>{
    const res = await this.db.getReadConnection();
    if (!res) return new TournamentRegistration();

    try{
      const [rows] = await res.conn.query<RowDataPacket[]>(
        `SELECT *
        FROM tournament_registrations
        WHERE tournament_id = ? AND team_id = ?`, [tournamentId, teamId]
      );
      return rows.length > 0 ? this.map(rows[0]) : new TournamentRegistration();
    }catch (err) {
      this.logger.error("TournamentRepository", "findById failed", err);
      return new TournamentRegistration();
    } finally { res.conn.release(); }
  } 

  async findAll(page:number, limit:number): Promise<TournamentRegistration[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    const offset = (page - 1) * limit;
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM tournament_registrations LIMIT ? OFFSET ?`, [limit, offset]
      );
      return rows.map((r) => this.map(r));
    } catch (err) {
      this.logger.error("TournamentRegistrationRepository", "findAll failed", err);
      return [];
    } finally { res.conn.release(); }
  }
}