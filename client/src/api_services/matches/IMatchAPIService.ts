import type { MatchDetailsDto } from "../../models/match/MatchDetailsDto";
import type { MatchDto } from "../../models/match/MatchDto";
import type { MatchResultDto } from "../../models/match/MatchResultDto";
import type { AddPlayersDto } from "../../models/match_player/AddPlayerDto";
import type { AddPlayersResponseDto, MatchPlayerDto } from "../../models/match_player/AddPlayerResponseDto";
import type { ApiResponse } from "../../types/api/ApiResponse";

export interface IMatchAPIService {
    getAllForTorunament(tournamentId: number) : Promise<ApiResponse<MatchDto[]>>;
    getDetails(id: number) : Promise<ApiResponse<MatchDetailsDto>>;
    setResult(id: number, payload: MatchResultDto) : Promise<ApiResponse<void>>;
    getPlayers(id: number, teamId: number): Promise<ApiResponse<MatchPlayerDto[]>>;
    addPlayers(id: number, payload: AddPlayersDto) : Promise<ApiResponse<AddPlayersResponseDto>>;
    removePlayer(id: number, userId: number) : Promise<ApiResponse<void>>;
    changePerformanceNotes(id: number, userId: number, payload: {notes: string}) : Promise<ApiResponse<void>>;
}