import type { UserWatchlistDto } from "../../models/user_watchlist/UserWatchlistDto";
import type { ApiResponse } from "../../types/api/ApiResponse";

export type { ApiResponse };

export interface IUserWatchListAPIService{
      getById(id: number, page?: number, limit?: number): Promise<ApiResponse<{ items: UserWatchlistDto[]; total: number }>>;
      delete(id: number, tournamentId: number): Promise<ApiResponse<void>>;
}