import { CreateUserWatchlistDto } from "../../DTOs/user_watchlists/CreateUserWatchlistDto";
import { UserWatchlistDto } from "../../DTOs/user_watchlists/UserWatchlistDto";
import { UserWatchlist } from "../../models/UserWatchlist";

export interface IUserWatchlistRepository {
  findAll(page?: number, limit?: number): Promise<UserWatchlistDto[]>;
  findByUserId(userId: number): Promise<UserWatchlistDto[]>
  create(dto: CreateUserWatchlistDto): Promise<UserWatchlist>;
  update(userId: number,tournamentId: number, fields: Partial<UserWatchlist>): Promise<boolean>;
  delete(userId: number,tournamentId: number): Promise<boolean>;
}