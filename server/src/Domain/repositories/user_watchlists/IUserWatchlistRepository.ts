import { CreateUserWatchlistDto } from "../../DTOs/user_watchlists/CreateUserWatchlistDto";
import { UserWatchlistDto } from "../../DTOs/user_watchlists/UserWatchlistDto";
import { UserWatchlist } from "../../models/UserWatchlist";

export interface IEntityRepository {
  findById(id: number): Promise<UserWatchlistDto | null>;
  findAll(page?: number, limit?: number): Promise<UserWatchlistDto[]>;
  create(dto: CreateUserWatchlistDto): Promise<UserWatchlist>;
  update(id: number, fields: Partial<UserWatchlist>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
}