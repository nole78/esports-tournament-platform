import { Result } from "../../common/Result";
import { MatchDto } from "../../DTOs/matches/MatchDto";
import { PaginatedListDto } from "../../DTOs/PaginatedListDto";
import { MatchResultDto } from '../../DTOs/matches/MatchResultDto';
import { UserDto } from "../../DTOs/users/UserDto";
import { AddPlayersDto } from "../../DTOs/match_players/AddPlayersDto";
import { AddPlayersResponseDto } from "../../DTOs/match_players/AddPlayersResponseDto";

export interface IMatchService{
    getAll(page?: number, limit?: number): Promise<Result<PaginatedListDto<MatchDto>>>;
    getAllPlayers(id: number): Promise<Result<UserDto[]>>;
    getById(id: number): Promise<Result<MatchDto>>;
    getByTeamId(teamId: number): Promise<Result<MatchDto[]>>;
    getByTournamentId(tournamentId: number): Promise<Result<MatchDto[]>>;
    setResult(id: number, result: MatchResultDto) : Promise<Result<void>>;
    setPerformanceNotes(id: number, userId: number, notes: string) : Promise<Result<void>>;
    addPlayersToMatch(id: number, dto: AddPlayersDto) :Promise<Result<AddPlayersResponseDto>>;
    removePlayerFromMatch(id: number, userId: number) : Promise<Result<void>>;    
}