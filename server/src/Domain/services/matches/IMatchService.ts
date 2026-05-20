import { Result } from "../../common/Result";
import { CreateMatchDto } from "../../DTOs/matches/CreateMatchDto";
import { MatchDto } from "../../DTOs/matches/MatchDto";
import { PaginatedListDto } from "../../DTOs/PaginatedListDto";

export interface IMatchService{
    getAll(page?: number, limit?: number): Promise<Result<PaginatedListDto<MatchDto>>>;
    getById(id: number): Promise<Result<MatchDto>>;
    getByTeamId(teamId: number): Promise<Result<MatchDto[]>>;
    getByTournamentId(tournamentId: number): Promise<Result<MatchDto[]>>;
    create(dto: CreateMatchDto): Promise<Result<MatchDto>>;
    update(id: number, fields: Partial<MatchDto>): Promise<Result<void>>;
    delete(id: number): Promise<Result<void>>;
}