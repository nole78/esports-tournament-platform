import { CreateMatchPlayerDto } from "../../DTOs/match_players/CreateMatchPlayerDto";
import { MatchPlayerDto } from "../../DTOs/match_players/MatchPlayerDto";
import { MatchPlayer } from "../../models/MatchPlayer";

export interface IMatchPlayerRepository {
  findByUserId(userId: number): Promise<MatchPlayerDto[]>;
  findByMatchId(matchId: number): Promise<MatchPlayerDto[]>;
  findByTeamId(teamId: number): Promise<MatchPlayerDto[]>;
  findAll(page?: number, limit?: number): Promise<MatchPlayerDto[]>;
  create(dto: CreateMatchPlayerDto): Promise<MatchPlayer>;
  update(userId: number, teamId: number, matchId: number, fields: Partial<MatchPlayer>): Promise<boolean>;
  delete(userId: number, teamId: number, matchId: number): Promise<boolean>;
}