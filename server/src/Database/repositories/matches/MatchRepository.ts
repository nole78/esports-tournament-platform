import { ResultSetHeader, RowDataPacket } from "mysql2";
import { IMatchRepository } from "../../../Domain/repositories/matches/IMatchRepository";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { DbManager } from "../../connection/DbConnectionPool";
import { Match } from "../../../Domain/models/Match";

export class MatchRepository implements IMatchRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  private map(r: RowDataPacket): Match {
    return new Match(r.match_id, 
      r.tournament_id, 
      r.blue_team_id, 
      r.red_team_id, 
      r.winner_team_id, 
      r.status, 
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
        `SELECT * FROM matches WHERE blue_team_id = ? OR red_team_id = ? ORDER BY id DESC`, [teamId,teamId]
      );
      return rows.map((r) => this.map(r));
    } catch (err) {
      this.logger.error("MatchRepository", "findByUserId failed", err);
      return [];
    } finally { res.conn.release(); }
  }

  async  findByTournamentId(tournamentId: number): Promise<Match[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM matches WHERE tournament_id = ? ORDER BY id DESC`, [tournamentId]
      );
      return rows.map((r) => this.map(r));
    } catch (err) {
      this.logger.error("MatchRepository", "findByUserId failed", err);
      return [];
    } finally { res.conn.release(); }
  }

  async create(match: Match): Promise<Match> {
    const res = await this.db.getWriteConnection();
    if (!res) return new Match;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `INSERT INTO matches (tournament_id, blue_team_id, red_team_id, winner_team_id,
        status, round_number, bracket_type, blue_team_score, red_team_score,
        winner_to_match_id, winner_to_slot, loser_to_match_id, loser_to_slot) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [ match.tournamentId, 
          match.blueTeamId, 
          match.redTeamId, 
          match.winnerTeamId, 
          match.status,
          match.roundNumber,
          match.bracketType,
          match.blueTeamScore,
          match.redTeamScore,
          match.winnerToMatchId,
          match.winnerToSlot,
          match.loserToMatchId,
          match.loserToSlot ]
      );
      if (result.insertId === 0) return new Match;
      return new Match(result.insertId, match.tournamentId, 
                                        match.blueTeamId, 
                                        match.redTeamId, 
                                        match.winnerTeamId, 
                                        match.status,
                                        match.roundNumber,
                                        match.bracketType,
                                        match.blueTeamScore,
                                        match.redTeamScore,
                                        match.winnerToMatchId,
                                        match.winnerToSlot,
                                        match.loserToMatchId,
                                        match.loserToSlot );
    } catch (err) {
      this.logger.error("MatchRepository", "create failed", err);
      return new Match;
    } finally { res.conn.release(); }
  }

  async update(id: number, fields: Partial<Match>): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;

    const  fieldMap: Record<string, string> = {
      tournamentId: "tournament_id", 
      blueTeamId: "blue_team_id", 
      redTeamId: "red_team_id", 
      winnerTeamId: "winner_team_id", 
      status: "status",
      roundNumber: "round_number",
      bracketType: "bracket_type",
      blueTeamScore: "blue_team_score",
      redTeamScore: "red_team_score",
      winnerToMatchId: "winner_to_match_id",
      winnerToSlot: "winner_to_slot",
      loserToMatchId: "loser_to_match_id",
      loserToSlot: "loser_to_slot" 
    }

    try {
      const entries = Object.entries(fields)
          .filter(([, v]) => v !== undefined)
          .map(([k,v]) => [fieldMap[k] ?? k, v]);
      
      if (entries.length === 0) return false;
      const setClause = entries.map(([k]) => `${k} = ?`).join(", ");
      const values = entries.map(([, v]) => v);
      const [result] = await res.conn.execute<ResultSetHeader>(
        `UPDATE matches SET ${setClause} WHERE match_id = ?`, [...values, id]
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("MatchRepository", "update failed", err);
      return false;
    } finally { res.conn.release(); }
  }

  async delete(id: number): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `DELETE FROM matches WHERE match_id = ?`, [id]
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("EntityRepository", "delete failed", err);
      return false;
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