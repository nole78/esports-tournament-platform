
import { UserWatchlist } from "../../models/UserWatchlist";

export interface IUserWatchlistReadRepository {
  findByUserId(userId: number): Promise<UserWatchlist[]>;
  findWatchlistItem(userId: number, tournamentId: number): Promise<UserWatchlist>;
  getTotal(userId: number): Promise<number>;
}