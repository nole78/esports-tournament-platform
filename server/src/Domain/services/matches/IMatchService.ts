import { Result } from "../../common/Result";
import { MatchDto } from "../../DTOs/matches/MatchDto";
import { PaginatedListDto } from "../../DTOs/PaginatedListDto";
import { MatchResultDto } from '../../DTOs/matches/MatchResultDto';

export interface IMatchService{
    getAll(page?: number, limit?: number): Promise<Result<PaginatedListDto<MatchDto>>>;
    getById(id: number): Promise<Result<MatchDto>>;
    getByTeamId(teamId: number): Promise<Result<MatchDto[]>>;
    getByTournamentId(tournamentId: number): Promise<Result<MatchDto[]>>;
    setResult(id: number, result: MatchResultDto) : Promise<Result<void>>;
}