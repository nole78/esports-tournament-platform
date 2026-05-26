import { CreateUserWatchlistDto } from "../../DTOs/user_watchlists/CreateUserWatchlistDto";
import { UserWatchlist } from "../../models/UserWatchlist";

export interface IUserWatchlistWriteRepository {
  create(dto: CreateUserWatchlistDto): Promise<UserWatchlist>;
  delete(userId: number,tournamentId: number): Promise<boolean>;
}