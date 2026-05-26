import { MatchPlayer } from "../../models/MatchPlayer";

export interface IMatchPlayerWriteRepository {
  create(matchPlayer: MatchPlayer): Promise<MatchPlayer>;
  update(userId: number, teamId: number, matchId: number, fields: Partial<MatchPlayer>): Promise<boolean>;
  delete(userId: number, teamId: number, matchId: number): Promise<boolean>;
}