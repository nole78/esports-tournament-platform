import { CreateTournamentInternalDto } from "../../DTOs/tournaments/CreateTournamentInternalDto";
import { TournamentDto } from "../../DTOs/tournaments/TorunamentDto";
import { TournamentInternalDto } from "../../DTOs/tournaments/TournamentInternalDto";
import { Tournament } from "../../models/Tournament";

export interface ITournamentRepository {
  findById(id: number): Promise<TournamentInternalDto | null>;
  findAll(page?: number, limit?: number): Promise<TournamentInternalDto[]>;
  create(dto: CreateTournamentInternalDto): Promise<Tournament>;
  update(id: number, fields: Partial<Tournament>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
}