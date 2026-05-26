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

  async createBulk(matches: Match[]): Promise<Match[]> {
    if(matches.length === 0) return [];
    const res = await this.db.getWriteConnection();
    if (!res) return [];
    try {
      const placeholder = matches.map(() => "(?, ?, ?, ?, ?, ?)").join(",");
      const query = `INSERT INTO matches (tournament_id, status, round_number, 
          bracket_type, blue_team_score, red_team_score)
          VALUES ${placeholder}`;
      const values = matches.flatMap(match => [ 
        match.tournamentId, 
        match.status,
        match.roundNumber,
        match.bracketType,
        match.blueTeamScore,
        match.redTeamScore
      ]);
      console.log(matches);
      const [result] = await res.conn.execute<ResultSetHeader>(query,values);
      if (result.affectedRows === 0 || result.insertId === 0) return [];
      let firstId = result.insertId;
      return matches.map(match => new Match(
          firstId++,
          match.tournamentId, 
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
          match.loserToSlot 
      ));
    } catch (err) {
      this.logger.error("MatchRepository", "create bulk failed", err);
      return [];
    } finally { res.conn.release(); }
  }

  async update(id: number, fields: Partial<Match>): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;

    const  fieldMap: Record<string, string> = {
      matchId: "match_id",
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
      console.log("------------"+fields);
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