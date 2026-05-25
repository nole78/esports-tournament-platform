import { ResultSetHeader, RowDataPacket } from "mysql2";
import { ITournamentRegistrationWriteRepository } from "../../../Domain/repositories/tournament_registrations/ITournamentRegistrationWriteRepository";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { DbManager } from "../../connection/DbConnectionPool";
import { TournamentRegistration } from '../../../Domain/models/TournamentRegistration';

export class TournamentRegistrationRepositoryWrite implements ITournamentRegistrationWriteRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  async create(tr: TournamentRegistration): Promise<TournamentRegistration> {
    const res = await this.db.getWriteConnection();
    if (!res) return new TournamentRegistration();
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `INSERT INTO tournament_registrations (team_id,tournament_id,seed) VALUES (?,?,?)`,
        [tr.teamId,tr.tournamentId,tr.seed]
      );
      if (result.insertId === 0) return new TournamentRegistration();
      return new TournamentRegistration(tr.teamId, tr.tournamentId, tr.seed);
    } catch (err) {
      this.logger.error("TournamentRegistrationRepository", "create failed", err);
      return new TournamentRegistration();
    } finally { res.conn.release(); }
  }

  async update(tournamentId: number,teamId: number, fields: Partial<TournamentRegistration>): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const entries = Object.entries(fields).filter(([, v]) => v);
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