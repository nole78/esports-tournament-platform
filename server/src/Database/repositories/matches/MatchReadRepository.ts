import { RowDataPacket } from "mysql2";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { DbManager } from "../../connection/DbConnectionPool";
import { Match } from "../../../Domain/models/Match";
import { IMatchReadRepository } from "../../../Domain/repositories/matches/IMatchReadRepository";
import { MatchSlot } from "../../../Domain/enums/MatchSlot";
import { BracketType } from "../../../Domain/enums/BracketType";

export class MatchReadRepository implements IMatchReadRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  private map(r: RowDataPacket): Match {
    return new Match(
      r.match_id, 
      r.tournament_id, 
      r.blue_team_id, 
      r.red_team_id, 
      r.winner_team_id, 
      r.status, 
      r.round_number,
      r.bracket_type,
      r.blue_team_score,
      r.red_team_score,
      r.winner_to_match_id,
      r.winner_to_slot,
      r.loser_to_match_id,
      r.loser_to_slot);
  }

  async findById(id: number): Promise<Match> {
    const res = await this.db.getReadConnection();
    if (!res) return new Match;
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(`SELECT * FROM matches WHERE match_id = ?`, [id]);
      return rows.length > 0 ? this.map(rows[0]) : new Match;
    } catch (err) {
      this.logger.error("MatchRepository", "findById failed", err);
      return new Match;
    } finally { res.conn.release(); }
  }

  async findAll(page = 1, limit = 20): Promise<Match[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    const offset = (page - 1) * limit;
    try {
      const [rows] = await res.conn.query<RowDataPacket[]>(
        `SELECT * FROM matches ORDER BY match_id DESC LIMIT ? OFFSET ?`, [limit, offset]
      );
      return rows.map((r) => this.map(r));
    } catch (err) {
      this.logger.error("MatchRepository", "findAll failed", err);
      return [];
    } finally { res.conn.release(); }
  }

  async findByTeamId(teamId: number): Promise<Match[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM matches WHERE blue_team_id = ? OR red_team_id = ?`, [teamId,teamId]
      );
      return rows.map((r) => this.map(r));
    } catch (err) {
      this.logger.error("MatchRepository", "findByTeamId failed", err);
      return [];
    } finally { res.conn.release(); }
  }

  async  findByTournamentId(tournamentId: number): Promise<Match[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM matches WHERE tournament_id = ?`, [tournamentId]
      );
      return rows.map((r) => this.map(r));
    } catch (err) {
      this.logger.error("MatchRepository", "findByTournamentId failed", err);
      return [];
    } finally { res.conn.release(); }
  }

  async getTotal(): Promise<number> {
    const res = await this.db.getReadConnection();
    if(!res) return 0;
    try
    {
      const [cnt] = await res.conn.execute<RowDataPacket[]>(`SELECT COUTN(*) as total FROM matches`);
      return cnt[0]?.total ?? 0;
    }
    catch(err){
      this.logger.error("MatchRepository","get total failed",err);
      return 0;
    } finally { res.conn.release(); }
  }
}