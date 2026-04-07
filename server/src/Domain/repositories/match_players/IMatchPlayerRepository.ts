import { CreateMatchPlayerDto } from "../../DTOs/match_players/CreateMatchPlayerDto";
import { MatchPlayerDto } from "../../DTOs/match_players/MatchPlayerDto";
import { MatchPlayer } from "../../models/MatchPlayer";

export interface IEntityRepository {
  findById(id: number): Promise<MatchPlayerDto | null>;
  findAll(page?: number, limit?: number): Promise<MatchPlayerDto[]>;
  create(dto: CreateMatchPlayerDto): Promise<MatchPlayer>;
  update(id: number, fields: Partial<MatchPlayer>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
}