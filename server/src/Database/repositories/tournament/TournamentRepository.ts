import { ITournamentRepository } from "../../../Domain/repositories/tournaments/ITournamentRepository";
import { Tournament } from '../../../Domain/models/Tournament';
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { TournamentDto } from "../../../Domain/DTOs/tournaments/TorunamentDto";
import { CreateTournamentInternalDto } from "../../../Domain/DTOs/tournaments/CreateTournamentInternalDto";
import { TournamentStatus } from '../../../Domain/enums/TournamentStatus';
import { TournamentInternalDto } from "../../../Domain/DTOs/tournaments/TournamentInternalDto";
import { TournamentFilterInternalDto } from "../../../Domain/DTOs/tournaments/TournamentFilterInternalDto";
import { PaginatedListDto } from '../../../Domain/DTOs/PaginatedListDto';

export class TournamentRepository implements ITournamentRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  private map(r: RowDataPacket): TournamentInternalDto {
    return new TournamentInternalDto(r.tournament_name, r.tournament_game_id, r.tournament_format, r.tournament_max_teams, r.tournament_application_deadline, r.tournament_prize_fund, r.tournament_status);
  }

  async findById(id: number): Promise<TournamentInternalDto | null> {
    const res = await this.db.getReadConnection();
    if (!res) return null;
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT t.tournament_name, t.tournament_game_id, t.tournament_format, t.tournament_max_teams, t.tournament_application_deadline, t.tournament_prize_fund, t.tournament_status
         FROM tournaments t 
         WHERE t.tournament_id = ?`, 
        [id]
      );
      return rows.length > 0 ? this.map(rows[0]) : null;
    } catch (err) {
      this.logger.error("TournamentRepository", "findById failed", err);
      return null;
    } finally { res.conn.release(); }
  }

  async findAll(page:number, limit:number): Promise<PaginatedListDto<TournamentInternalDto>> {
    const res = await this.db.getReadConnection();
    if (!res) return new PaginatedListDto([], 0, page, limit);
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

      return new PaginatedListDto(items, cnt[0]?.total ?? 0, page, limit);
    } catch (err) {
      this.logger.error("TournamentRepository", "findAll failed", err);
      console.error("findAll error:", err);
      return new PaginatedListDto([], 0, page, limit);
    } finally { res.conn.release(); }
  }

  async create(dto: CreateTournamentInternalDto): Promise<Tournament> {
    const res = await this.db.getWriteConnection();
    if (!res) return new Tournament();
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `INSERT INTO tournaments (tournament_name, tournament_game_id, tournament_format, tournament_max_teams, tournament_application_deadline, tournament_prize_fund, tournament_status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [dto.tournamentName, dto.tournamentGameId, dto.tournamentFormat, dto.tournamentMaxTeams, dto.tournamentApplicationDeadline, dto.tournamentPrizeFund, dto.tournamentStatus]
      );
      if (result.insertId === 0) return new Tournament();

      return new Tournament(
        result.insertId, 
        dto.tournamentName, 
        dto.tournamentGameId, 
        dto.tournamentFormat, 
        dto.tournamentMaxTeams, 
        new Date(dto.tournamentApplicationDeadline), 
        dto.tournamentPrizeFund, 
        dto.tournamentStatus
      );
    } catch (err) {
      this.logger.error("TournamentRepository", "create failed", err);
      return new Tournament();
    } finally { res.conn.release(); }
  }  

  async findFiltered(fields: Partial<TournamentFilterInternalDto>, page:number, limit:number): Promise<PaginatedListDto<TournamentInternalDto>>{
    const res = await this.db.getReadConnection();
    if (!res) return new PaginatedListDto([], 0, page, limit);
    const offset = Math.max(0, Math.floor((page - 1) * limit));
    const lim    = Math.max(1, Math.floor(limit));

    const fieldMap: Record<string, string> = {
      tournamentGameId: "tournament_game_id",
      tournamentFormat: "tournament_format",
      tournamentStatus: "tournament_status"
    }

    try {
      const entries = Object.entries(fields).filter(([, v]) => v !== undefined).map(([k,v]) => [fieldMap[k] ?? k, v]);
      if (entries.length === 0) return new PaginatedListDto([], 0, page, limit);
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

      return new PaginatedListDto(items, cnt[0]?.total ?? 0, page, limit);
    } catch (err) {
      this.logger.error("TournamentRepository", "findAll failed", err);
      console.error("findAll error:", err);
      return new PaginatedListDto([], 0, page, limit);
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