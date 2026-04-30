import { CreateTournamentInternalDto } from "../../DTOs/tournaments/CreateTournamentInternalDto";
import { TournamentDto } from "../../DTOs/tournaments/TorunamentDto";
import { Tournament } from "../../models/Tournament";

export interface ITournamentRepository {
  findById(id: number): Promise<TournamentDto | null>;
  findAll(page?: number, limit?: number): Promise<TournamentDto[]>;
  create(dto: CreateTournamentInternalDto): Promise<Tournament>;
  update(id: number, fields: Partial<Tournament>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
}