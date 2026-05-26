import { CreateUserWatchlistDto } from "../../DTOs/user_watchlists/CreateUserWatchlistDto";
import { UserWatchlist } from "../../models/UserWatchlist";

export interface IUserWatchlistRepository {
  findByUserId(userId: number, page: number, limit: number): Promise<UserWatchlist[]>;
  findWatchlistItem(userId: number, tournamentId: number): Promise<UserWatchlist>;
  create(dto: CreateUserWatchlistDto): Promise<UserWatchlist>;
  delete(userId: number,tournamentId: number): Promise<boolean>;
  getTotal(userId: number): Promise<number>;
}