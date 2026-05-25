import type { UserWatchlistDto } from "../../models/user_watchlist/UserWatchlistDto";
export type ApiResponse<T> = { success: boolean; message: string; data?: T };

export interface IUserWatchListAPIService{
      getById(id: number, page?: number, limit?: number): Promise<ApiResponse<{ items: UserWatchlistDto[]; total: number }>>;
      delete(id: number, tournamentId: number): Promise<ApiResponse<void>>;
}