import { ResultSetHeader } from "mysql2";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";
import { DbManager } from "../../connection/DbConnectionPool";
import { Match } from "../../../Domain/models/Match";
import { IMatchWriteRepository } from "../../../Domain/repositories/matches/IMatchWriteRepository";

export class MatchWriteRepository implements  IMatchWriteRepository{
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

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
}