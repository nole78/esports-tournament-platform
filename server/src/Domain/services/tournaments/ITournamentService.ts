import { CreateTournamentDto } from "../../DTOs/tournaments/CreateTournamentDto";
import { TournamentDto } from "../../DTOs/tournaments/TorunamentDto";
import { PaginatedListDto } from "../../DTOs/PaginatedListDto";
import { Tournament } from "../../models/Tournament";
import { TournamentFilterDto } from "../../DTOs/tournaments/TournamentFilterDto";

export interface ITournamentService {
  getAll(page?: number, limit?: number): Promise<PaginatedListDto<TournamentDto>>;
  getById(id: number): Promise<TournamentDto | null>;
  create(dto: CreateTournamentDto): Promise<Tournament | null>;
  getFiltered(fields: Partial<TournamentFilterDto>, page?:number, limit?: number): Promise<PaginatedListDto<TournamentDto>>;
  update(id: number, fields: Partial<Tournament>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
}
