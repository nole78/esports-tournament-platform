import { ITournamentRepository } from "../../../Domain/repositories/tournaments/ITournamentRepository";
import { Tournament } from '../../../Domain/models/Tournament';
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";

export class TournamentRepository implements ITournamentRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  private map(r: RowDataPacket): Tournament {
    return new Tournament(r.tournament_id, r.tournament_name, r.tournament_game_id, r.tournament_format, r.tournament_max_teams, r.tournament_application_deadline, r.tournament_prize_fund, r.tournament_status);
  }

  async findTotal(): Promise<number>{
    const res = await this.db.getReadConnection();
    if(!res) return 0;
    try{
      const [cnt] = await res.conn.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM tournaments`
      );

      return cnt[0]?.total ?? 0;
    } catch (err) {
      this.logger.error("TournamentRepository", "findTotal failed", err);
      console.error("findAll error:", err);
      return 0;
    } finally { res.conn.release(); }
  }

  async findTotalFiltered(tournamentGameId?:number, tournamentFormat?:string, tournamentStatus?:string): Promise<number>{
    const res = await this.db.getReadConnection();
    if(!res) return 0;

    const fieldMap: Record<string, string> = {
      tournamentGameId: "tournament_game_id",
      tournamentFormat: "tournament_format",
      tournamentStatus: "tournament_status"
    }
    const filter = {tournamentGameId, tournamentFormat, tournamentStatus};
    try {
      const entries = Object.entries(filter).filter(([, v]) => v !== undefined).map(([k,v]) => [fieldMap[k] ?? k, v]);
      if (entries.length === 0) return 0;
      const filterClause = entries.map(([k]) => `${k} = ?`).join(" AND ");
      const values = entries.map(([, v]) => v);
      const [cnt] = await res.conn.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM tournaments 
        WHERE ${filterClause}`,
        [...values]
      );

      return cnt[0]?.total ?? 0;
    } catch (err) {
      this.logger.error("TournamentRepository", "findTotalFiltered failed", err);
      console.error("findAll error:", err);
      return 0;
    } finally { res.conn.release(); }
  }

  async findById(id: number): Promise<Tournament> {
    const res = await this.db.getReadConnection();
    if (!res) return new Tournament();
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT t.tournament_name, t.tournament_game_id, t.tournament_format, t.tournament_max_teams, t.tournament_application_deadline, t.tournament_prize_fund, t.tournament_status
         FROM tournaments t 
         WHERE t.tournament_id = ?`, 
        [id]
      );
      return rows.length > 0 ? this.map(rows[0]) : new Tournament();
    } catch (err) {
      this.logger.error("TournamentRepository", "findById failed", err);
      return new Tournament();
    } finally { res.conn.release(); }
  }

  async findAll(page:number, limit:number): Promise<Tournament[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    const offset = Math.max(0, Math.floor((page - 1) * limit));
    const lim    = Math.max(1, Math.floor(limit));
    try {
      const [rows] = await res.conn.query<RowDataPacket[]>(
        `SELECT tournament_name, tournament_game_id, tournament_format, tournament_max_teams, tournament_application_deadline, tournament_prize_fund, tournament_status
         FROM tournaments
         ORDER BY tournament_id DESC LIMIT ? OFFSET ?`, 
        [lim, offset]
      );

      const [cnt] = await res.conn.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM tournaments`
      );

      const items = rows.map((r) => this.map(r))

      return items;
    } catch (err) {
      this.logger.error("TournamentRepository", "findAll failed", err);
      console.error("findAll error:", err);
      return [];
    } finally { res.conn.release(); }
  }

  async create(t: Tournament): Promise<Tournament> {
    const res = await this.db.getWriteConnection();
    if (!res) return new Tournament();
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `INSERT INTO tournaments (tournament_name, tournament_game_id, tournament_format, tournament_max_teams, tournament_application_deadline, tournament_prize_fund, tournament_status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [t.tournamentName, t.tournamentGameId, t.tournamentFormat, t.tournamentMaxTeams, t.tournamentApplicationDeadline, t.tournamentPrizeFund, t.tournamentStatus]
      );
      if (result.insertId === 0) return new Tournament();

      return new Tournament(
        result.insertId, 
        t.tournamentName, 
        t.tournamentGameId, 
        t.tournamentFormat, 
        t.tournamentMaxTeams, 
        new Date(t.tournamentApplicationDeadline), 
        t.tournamentPrizeFund, 
        t.tournamentStatus
      );
    } catch (err) {
      this.logger.error("TournamentRepository", "create failed", err);
      return new Tournament();
    } finally { res.conn.release(); }
  }  

  async findFiltered(tournamentGameId:number, tournamentFormat:string, tournamentStatus:string, page:number, limit:number): Promise<Tournament[]>{
    const res = await this.db.getReadConnection();
    if (!res) return [];
    const offset = Math.max(0, Math.floor((page - 1) * limit));
    const lim    = Math.max(1, Math.floor(limit));

    const fieldMap: Record<string, string> = {
      tournamentGameId: "tournament_game_id",
      tournamentFormat: "tournament_format",
      tournamentStatus: "tournament_status"
    }
    const filter = {tournamentGameId, tournamentFormat, tournamentStatus};
    try {
      const entries = Object.entries(filter).filter(([, v]) => v !== undefined).map(([k,v]) => [fieldMap[k] ?? k, v]);
      if (entries.length === 0) return [];
      const filterClause = entries.map(([k]) => `${k} = ?`).join(" AND ");
      const values = entries.map(([, v]) => v);
      
      const [rows] = await res.conn.query<RowDataPacket[]>(
        `SELECT tournament_name, tournament_game_id, tournament_format, tournament_max_teams, tournament_application_deadline, tournament_prize_fund, tournament_status
         FROM tournaments
         WHERE ${filterClause}
         ORDER BY tournament_id DESC LIMIT ? OFFSET ?`, [...values, lim, offset]
      );

      const [cnt] = await res.conn.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM tournaments 
        WHERE ${filterClause}`,
        [...values]
      );

      const items = rows.map((r) => this.map(r));

      return items;
    } catch (err) {
      this.logger.error("TournamentRepository", "findAll failed", err);
      console.error("findAll error:", err);
      return [];
    } finally { res.conn.release(); }
  }

  async update(id: number, fields: Partial<Tournament>): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;

    const fieldMap: Record<string, string> = {
      tournamentName: "tournament_name",
      tournamentGameId: "tournament_game_id",
      tournamentFormat: "tournament_format",
      tournamentMaxTeams: "tournament_max_teams",
      tournamentApplicationDeadline: "tournament_application_deadline",
      tournamentPrizeFund: "tournament_prize_fund",
      tournamentStatus: "tournament_status"
    }

    try {
      const entries = Object.entries(fields).filter(([, v]) => v !== undefined).map(([k,v]) => [fieldMap[k] ?? k, v]);
      if (entries.length === 0) return false;
      const setClause = entries.map(([k]) => `${k} = ?`).join(", ");
      const values = entries.map(([, v]) => v);
      const [result] = await res.conn.execute<ResultSetHeader>(
        `UPDATE tournaments SET ${setClause} WHERE tournament_id = ?`, [...values, id]
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("TournamentRepository", "update failed", err);
      return false;
    } finally { res.conn.release(); }
  }

  async delete(id: number): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `DELETE FROM tournaments WHERE tournament_id = ?`, [id]
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("TournamentRepository", "delete failed", err);
      return false;
    } finally { res.conn.release(); }
  }
}