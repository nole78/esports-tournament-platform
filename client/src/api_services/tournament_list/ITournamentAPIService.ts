import type { TournamentDto } from "../../models/tournament/TournamentDto";
import type { TournamentFilterDto } from "../../models/tournament/TournamentFilterDto";
import type { UserWatchlistDto } from "../../models/user_watchlist/UserWatchlistDto";
import type { ApiResponse } from "../../types/api/ApiResponse";

export type { ApiResponse };

export interface ITournamentAPIService {
    getAll(payload: Partial<TournamentFilterDto>, page?: number, limit?: number): Promise<ApiResponse<{ items: TournamentDto[]; total: number }>>;
    getById(id: number): Promise<ApiResponse<TournamentDto>>;
    create(payload: Record<string, unknown>): Promise<ApiResponse<TournamentDto>>;
    update(id: number, payload: Partial<TournamentDto>): Promise<ApiResponse<void>>;
    delete(id: number): Promise<ApiResponse<void>>;
    addToWatchList(id: number, userId: number): Promise<ApiResponse<UserWatchlistDto>>;
    removeFromWatchList(id: number, userId: number): Promise<ApiResponse<void>>;
    findWatchListItem(payload: { userId: number, tournamentId: number }): Promise<ApiResponse<boolean>>;
}