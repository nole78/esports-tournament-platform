import { MatchPlayer } from "../../models/MatchPlayer";

export interface IMatchPlayerRepository {
  findByUserId(userId: number): Promise<MatchPlayer[]>;
  findByMatchId(matchId: number): Promise<MatchPlayer[]>;
  findByTeamId(teamId: number): Promise<MatchPlayer[]>;
  findAll(page?: number, limit?: number): Promise<MatchPlayer[]>;
  create(matchPlayer: MatchPlayer): Promise<MatchPlayer>;
  update(userId: number, teamId: number, matchId: number, fields: Partial<MatchPlayer>): Promise<boolean>;
  delete(userId: number, teamId: number, matchId: number): Promise<boolean>;
}