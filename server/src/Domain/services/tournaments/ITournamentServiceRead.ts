import { Result } from "../../common/Result";
import { PaginatedListDto } from "../../DTOs/PaginatedListDto";
import { CreateTournamentDto } from "../../DTOs/tournaments/CreateTournamentDto";
import { TournamentDto } from "../../DTOs/tournaments/TorunamentDto";
import { TournamentFilterDto } from "../../DTOs/tournaments/TournamentFilterDto";

export interface ITournamentServiceRead {
  getAll(page?: number, limit?: number): Promise<Result<PaginatedListDto<TournamentDto>>>;
  getById(id: number): Promise<Result<TournamentDto>>;
  getFiltered(fields: Partial<TournamentFilterDto>, page?:number, limit?: number): Promise<Result<PaginatedListDto<TournamentDto>>>;
}