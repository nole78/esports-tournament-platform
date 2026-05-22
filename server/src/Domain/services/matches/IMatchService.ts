import { Result } from "../../common/Result";
import { CreateMatchDto } from "../../DTOs/matches/CreateMatchDto";
import { MatchDto } from "../../DTOs/matches/MatchDto";
import { PaginatedListDto } from "../../DTOs/PaginatedListDto";
import { MatchResultDto } from '../../DTOs/matches/MatchResultDto';
import { UserDto } from "../../DTOs/users/UserDto";
import { AddPlayersDto } from "../../DTOs/match_players/AddPlayersDto";

export interface IMatchService{
    getAll(page?: number, limit?: number): Promise<Result<PaginatedListDto<MatchDto>>>;
    getAllPlayers(id: number): Promise<Result<UserDto[]>>;
    getById(id: number): Promise<Result<MatchDto>>;
    getByTeamId(teamId: number): Promise<Result<MatchDto[]>>;
    getByTournamentId(tournamentId: number): Promise<Result<MatchDto[]>>;
    create(dto: CreateMatchDto): Promise<Result<MatchDto>>;
    setResult(id: number, result: MatchResultDto) : Promise<Result<void>>;
    setPerformanceNotes(id: number, userId: number, notes: string) : Promise<Result<void>>;
    addPlayersToMatch(id: number, dto: AddPlayersDto) :Promise<Result<void>>;
    removePlayerFromMatch(id: number, userId: number) : Promise<Result<void>>;    
    delete(id: number): Promise<Result<void>>;
}