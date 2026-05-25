import { Result } from "../../common/Result";
import { CreateUserWatchlistDto } from "../../DTOs/user_watchlists/CreateUserWatchlistDto";
import { UserWatchlistDto } from "../../DTOs/user_watchlists/UserWatchlistDto";
import { PaginatedListDto } from "../../DTOs/PaginatedListDto";

export interface IUserWatchlistService{
    getByUserId(userId: number, page?: number, limit?: number) : Promise<Result<PaginatedListDto<UserWatchlistDto>>>
    findWatchListItem(userId: number, tournamentId: number): Promise<Result<boolean>>
    add(dto: CreateUserWatchlistDto) : Promise<Result<UserWatchlistDto>>
    remove(userId: number, tournamentId: number) : Promise<Result<void>>
}