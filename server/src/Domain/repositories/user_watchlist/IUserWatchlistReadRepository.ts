
import { UserWatchlist } from "../../models/UserWatchlist";

export interface IUserWatchlistReadRepository {
  findByUserId(userId: number, page: number, limit: number): Promise<UserWatchlist[]>;
  findWatchlistItem(userId: number, tournamentId: number): Promise<UserWatchlist>;
  getTotal(userId: number): Promise<number>;
}