import { CreateTournamentInternalDto } from "../../DTOs/tournaments/CreateTournamentInternalDto";
import { TournamentFilterInternalDto } from "../../DTOs/tournaments/TournamentFilterInternalDto";
import { TournamentInternalDto } from "../../DTOs/tournaments/TournamentInternalDto";
import { Tournament } from "../../models/Tournament";
import { PaginatedListDto } from '../../DTOs/PaginatedListDto';

export interface ITournamentRepository {
  findById(id: number): Promise<TournamentInternalDto | null>;
  findAll(page?: number, limit?: number): Promise<PaginatedListDto<TournamentInternalDto>>;
  create(dto: CreateTournamentInternalDto): Promise<Tournament>;
  findFiltered(fields: Partial<TournamentFilterInternalDto>, page?:number, limit?: number): Promise<PaginatedListDto<TournamentInternalDto>>;
  update(id: number, fields: Partial<Tournament>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
}