/*import { ResultSetHeader, RowDataPacket } from "mysql2";
import { ITournamentRegistrationRepository } from "../../../Domain/repositories/tournament_registrations/ITournamentRegistrationRepository";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { DbManager } from "../../connection/DbConnectionPool";
import { TournamentRegistrationDto } from "../../../Domain/DTOs/tournament_registrations/TournamentRegistrationDto";
import { CreateTournamentRegistrationDto } from '../../../Domain/DTOs/tournament_registrations/CreateTournamentRegistrationDto';
import { TournamentRegistration } from '../../../Domain/models/TournamentRegistration';

export class TournamentRegistrationRepository implements ITournamentRegistrationRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  private map(r: RowDataPacket): TournamentRegistrationDto {
    // TODO: implement
    return new TournamentRegistrationDto();
  }

  async findByTeamId(teamId: number): Promise<TournamentRegistrationDto[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM tournament_registrations WHERE team_id = ? ORDER BY tournament_id DESC`, [teamId]
      );
      return rows.map((r) => this.map(r));
    } catch (err) {
      this.logger.error("TournamentRegistrationRepository", "findByTeamId failed", err);
      return [];
    } finally { res.conn.release(); }
  }

  async findByTournamentId(tournamentId: number): Promise<TournamentRegistrationDto[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM tournament_registrations WHERE tournament_id = ? ORDER BY team_id DESC`, [tournamentId]
      );
      return rows.map((r) => this.map(r));
    } catch (err) {
      this.logger.error("TournamentRegistrationRepository", "findByTournamentId failed", err);
      return [];
    } finally { res.conn.release(); }
  }

  async findAll(page = 1, limit = 20): Promise<TournamentRegistrationDto[]> {
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

  async create(dto: CreateTournamentRegistrationDto): Promise<TournamentRegistration> {
    const res = await this.db.getWriteConnection();
    if (!res) return new TournamentRegistration();
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `INSERT INTO tournament_registrations (team_id,tournament_id,seed) VALUES (?,?)`,
        [dto.teamId,dto.tournamentId]
      );
      if (result.insertId === 0) return new TournamentRegistration();
      return new TournamentRegistration(result.insertId, dto.teamId, dto.tournamentId);
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
}*/