import { ITournamentRepositoryWrite } from "../../../Domain/repositories/tournaments/ITournamentRepositoryWrite";
import { Tournament } from '../../../Domain/models/Tournament';
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";

export class TournamentRepositoryWrite implements ITournamentRepositoryWrite {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  private map(r: RowDataPacket): Tournament {
    return new Tournament(r.tournament_id, r.tournament_name, r.tournament_game_id, r.tournament_format, r.tournament_max_teams, r.tournament_application_deadline, r.tournament_prize_fund, r.tournament_status);
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

  async update(id: number, fields: Partial<Tournament>): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;

    const fieldMap: Record<string, string> = {
      tournamentName: "tournament_name",
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