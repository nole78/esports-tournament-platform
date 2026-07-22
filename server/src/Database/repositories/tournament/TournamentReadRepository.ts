import { RowDataPacket } from "mysql2";
import { ITournamentReadRepository } from "../../../Domain/repositories/tournaments/ITournamentReadRepository";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { DbManager } from "../../connection/DbConnectionPool";
import { Tournament } from "../../../Domain/models/Tournament";

export class TournamentReadRepository implements ITournamentReadRepository {
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
      return 0;
    } finally { 
        if(!res.isTransaction)
        res.conn.release(); 
    }
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
      const entries = Object.entries(filter).filter(([, v]) => v).map(([k,v]) => [fieldMap[k] ?? k, v]);
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
      return 0;
    } finally { 
        if(!res.isTransaction)
        res.conn.release();
    }
  }

  async findById(id: number): Promise<Tournament> {
    const res = await this.db.getReadConnection();
    if (!res) return new Tournament();
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT tournament_id, tournament_name, tournament_game_id, tournament_format, tournament_max_teams, tournament_application_deadline, tournament_prize_fund, tournament_status
         FROM tournaments
         WHERE tournament_id = ?`, 
        [id]
      );
      return rows.length > 0 ? this.map(rows[0]) : new Tournament();
    } catch (err) {
      this.logger.error("TournamentRepository", "findById failed", err);
      return new Tournament();
    } finally {
        if(!res.isTransaction)
        res.conn.release();
    }
  }

  async findAll(page:number, limit:number): Promise<Tournament[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    const offset = Math.max(0, Math.floor((page - 1) * limit));
    const lim    = Math.max(1, Math.floor(limit));
    try {
      const [rows] = await res.conn.query<RowDataPacket[]>(
        `SELECT tournament_id, tournament_name, tournament_game_id, tournament_format, tournament_max_teams, tournament_application_deadline, tournament_prize_fund, tournament_status
         FROM tournaments
         ORDER BY tournament_id DESC LIMIT ? OFFSET ?`, 
        [lim, offset]
      );

      const items = rows.map((r) => this.map(r))

      return items;
    } catch (err) {
      this.logger.error("TournamentRepository", "findAll failed", err);
      return [];
    } finally {
        if(!res.isTransaction)
        res.conn.release();
    }
  }

  async findFiltered(tournamentGameId?:number, tournamentFormat?:string, tournamentStatus?:string, page:number = 1, limit:number = 10): Promise<Tournament[]>{
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
      const entries = Object.entries(filter).filter(([, v]) => v).map(([k,v]) => [fieldMap[k] ?? k, v]);
      if (entries.length === 0) return [];
      const filterClause = entries.map(([k]) => `${k} = ?`).join(" AND ");
      const values = entries.map(([, v]) => v);
      
      const [rows] = await res.conn.query<RowDataPacket[]>(
        `SELECT tournament_id, tournament_name, tournament_game_id, tournament_format, tournament_max_teams, tournament_application_deadline, tournament_prize_fund, tournament_status
         FROM tournaments
         WHERE ${filterClause}
         ORDER BY tournament_id DESC LIMIT ? OFFSET ?`, [...values, lim, offset]
      );

      const [cnt] = await res.conn.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM tournaments 
        WHERE ${filterClause}`,
        [...values]
      );

      const items = rows.map((r) => this.map(r));

      return items;
    } catch (err) {
      this.logger.error("TournamentRepository", "findAll failed", err);
      return [];
    } finally {
        if(!res.isTransaction)
        res.conn.release();
    }
  }

  async findByIds(ids: number[]): Promise<Tournament[]>{
    if (!ids || ids.length === 0) return [];
    
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const placeholders = ids.map(() => "?").join(",");
      const [rows] = await res.conn.query<RowDataPacket[]>(
        `SELECT tournament_id, tournament_name, tournament_game_id, tournament_format, tournament_max_teams, tournament_application_deadline, tournament_prize_fund, tournament_status
         FROM tournaments
         WHERE tournament_id IN (${placeholders})`, 
        ids
      );

      const items = rows.map((r) => this.map(r));
      return items;
    } catch (err) {
      this.logger.error("TournamentRepository", "findByIds failed", err);
      return [];
    } finally {
        if(!res.isTransaction)
        res.conn.release();
    }
  }
}