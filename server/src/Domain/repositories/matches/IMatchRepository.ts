import { CreateMatchDto } from "../../DTOs/matches/CreateMatchDto";
import { MatchDto } from "../../DTOs/matches/MatchDto";
import { Match } from "../../models/Match";

export interface IMatchRepository {
  findById(id: number): Promise<MatchDto | null>;
  findAll(page?: number, limit?: number): Promise<MatchDto[]>;
  findByTeamId(teamId: number): Promise<MatchDto[]>;
  create(dto: CreateMatchDto): Promise<Match>;
  update(id: number, fields: Partial<Match>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
}