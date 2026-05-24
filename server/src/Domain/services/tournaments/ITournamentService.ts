import { CreateTournamentDto } from "../../DTOs/tournaments/CreateTournamentDto";
import { TournamentDto } from "../../DTOs/tournaments/TorunamentDto";
import { PaginatedListDto } from "../../DTOs/PaginatedListDto";
import { Tournament } from "../../models/Tournament";
import { TournamentFilterDto } from "../../DTOs/tournaments/TournamentFilterDto";
import { Result } from "../../common/Result";

export interface ITournamentService {
  getAll(page?: number, limit?: number): Promise<Result<PaginatedListDto<TournamentDto>>>;
  getById(id: number): Promise<Result<TournamentDto>>;
  create(dto: CreateTournamentDto): Promise<Result<TournamentDto>>;
  getFiltered(fields: Partial<TournamentFilterDto>, page?:number, limit?: number): Promise<Result<PaginatedListDto<TournamentDto>>>;
  update(id: number, fields: Partial<Tournament>): Promise<Result<void>>;
  delete(id: number): Promise<Result<void>>;
}
