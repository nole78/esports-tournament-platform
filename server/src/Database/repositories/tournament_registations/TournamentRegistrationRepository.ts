import { ResultSetHeader, RowDataPacket } from "mysql2";
import { ITournamentRegistrationRepository } from "../../../Domain/repositories/tournament_registrations/ITournamentRegistrationRepository";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { DbManager } from "../../connection/DbConnectionPool";
import { TournamentRegistration } from '../../../Domain/models/TournamentRegistration';

export class TournamentRegistrationRepository implements ITournamentRegistrationRepository {
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

  async findTotalByTournamentId(tournamentId: number): Promise<number>{
    const res = await this.db.getReadConnection();
    if(!res) return 0;
    try{
      const [cnt] = await res.conn.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM tournament_registrations 
        WHERE tournament_id = ?`,[tournamentId]
      );

      return cnt[0]?.total ?? 0;
    } catch (err) {
      this.logger.error("TournamentRegistrationRepository", "findTotalByTournamentId failed", err);
      return 0;
    } finally { res.conn.release(); }
  }

  async findByTeamId(teamId: number, page:number, limit:number): Promise<TournamentRegistration[]> {
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

  async findByTournamentId(tournamentId: number, page:number, limit:number): Promise<TournamentRegistration[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    const offset = Math.max(0, Math.floor((page - 1) * limit));
    const lim    = Math.max(1, Math.floor(limit));
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * 
        FROM tournament_registrations 
        WHERE tournament_id = ? 
        ORDER BY team_id DESC LIMIT ? OFFSET ?`, [tournamentId, lim, offset]
      );
      return rows.map((r) => this.map(r));
    } catch (err) {
      this.logger.error("TournamentRegistrationRepository", "findByTournamentId failed", err);
      return [];
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

  async create(tr: TournamentRegistration): Promise<TournamentRegistration> {
    const res = await this.db.getWriteConnection();
    if (!res) return new TournamentRegistration();
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `INSERT INTO tournament_registrations (team_id,tournament_id,seed) VALUES (?,?)`,
        [tr.teamId,tr.tournamentId]
      );
      if (result.insertId === 0) return new TournamentRegistration();
      return new TournamentRegistration(result.insertId, tr.teamId, tr.tournamentId);
    } catch (err) {
      this.logger.error("TournamentRegistrationRepository", "create failed", err);
      return new TournamentRegistration();
    } finally { res.conn.release(); }
  }

  async update(tournamentId: number,teamId: number, fields: Partial<TournamentRegistration>): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const entries = Object.entries(fields).filter(([, v]) => v !== undefined);
      if (entries.length === 0) return false;
      const setClause = entries.map(([k]) => `${k} = ?`).join(", ");
      const values = entries.map(([, v]) => v);
      const [result] = await res.conn.execute<ResultSetHeader>(
        `UPDATE tournament_registrations SET ${setClause} WHERE tournament_id = ? AND team_id = ?`, [...values, tournamentId, teamId]
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("TournamentRegistrationRepository", "update failed", err);
      return false;
    } finally { res.conn.release(); }
  }

  async delete(tournamentId: number,teamId: number): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `DELETE FROM tournament_registrations WHERE tournament_id = ? AND team_id = ?`, [tournamentId, teamId]
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("TournamentRegistrationRepository", "delete failed", err);
      return false;
    } finally { res.conn.release(); }
  }
}