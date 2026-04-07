import { CreateTournamentDto } from "../../DTOs/tournaments/CreateTournamentDto";
import { TournamentDto } from "../../DTOs/tournaments/TorunamentDto";
import { Tournament } from "../../models/Tournament";

export interface IEntityRepository {
  findById(id: number): Promise<TournamentDto | null>;
  findAll(page?: number, limit?: number): Promise<TournamentDto[]>;
  create(dto: CreateTournamentDto): Promise<Tournament>;
  update(id: number, fields: Partial<Tournament>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
}