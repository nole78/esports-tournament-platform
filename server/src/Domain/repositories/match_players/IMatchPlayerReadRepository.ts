import { MatchPlayer } from "../../models/MatchPlayer";

export interface IMatchPlayerReadRepository {
  findOne(userId: number, matchId: number): Promise<MatchPlayer>;
  findByUserId(userId: number): Promise<MatchPlayer[]>;
  findByMatchId(matchId: number): Promise<MatchPlayer[]>;
  findByTeamId(teamId: number): Promise<MatchPlayer[]>;
  findAll(page?: number, limit?: number): Promise<MatchPlayer[]>;
}