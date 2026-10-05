import { Result } from "../../common/Result";
import { PaginatedListDto } from "../../DTOs/PaginatedListDto";
import { TournamentDto } from "../../DTOs/tournaments/TorunamentDto";
import { TournamentFilterDto } from "../../DTOs/tournaments/TournamentFilterDto";

export interface ITournamentReadService {
  getAll(filters: Partial<TournamentFilterDto>, page?: number, limit?: number, userId?: number): Promise<Result<PaginatedListDto<TournamentDto>>>;
  getById(id: number): Promise<Result<TournamentDto>>;
}