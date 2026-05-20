import { ErrorType } from '../../Domain/common/ErrorType';
import { Result } from '../../Domain/common/Result';
import { CreateUserWatchlistDto } from '../../Domain/DTOs/user_watchlists/CreateUserWatchlistDto';
import { UserWatchlistDto } from '../../Domain/DTOs/user_watchlists/UserWatchlistDto';
import { UserWatchlist } from '../../Domain/models/UserWatchlist';
import { PaginatedListDto } from '../../Domain/DTOs/PaginatedListDto';
import { IUserWatchlistRepository } from '../../Domain/repositories/user_watchlist/IUserWatchlistRepository';
import { IUserWatchlistService } from '../../Domain/services/user_watchlist/IUserWatchlistService';

export class UserWatchlistService implements IUserWatchlistService {
    public constructor(private readonly watchlistRepo : IUserWatchlistRepository){}

    private toUserWatchlistDto(watchlist: UserWatchlist) : UserWatchlistDto{
        return new UserWatchlistDto(watchlist.userId, watchlist.tournamentId, watchlist.addedAt);
    }

    async getByUserId(userId: number, page?: number, limit?: number) : Promise<Result<PaginatedListDto<UserWatchlistDto>>>
    {
        const items = await this.watchlistRepo.findByUserId(userId, page ?? 1, limit ?? 20);
        const total = await this.watchlistRepo.getTotal(userId);
        const list = items.map(i => this.toUserWatchlistDto(i));
        return Result.Success(new PaginatedListDto(list, total, page ?? 1, limit ?? 20));
    }

    async add(dto: CreateUserWatchlistDto) : Promise<Result<UserWatchlistDto>>
    {
        const item = await this.watchlistRepo.findWatchlistItem(dto.userId, dto.tournamentId);
        if(item.userId !== 0)
            return Result.Failure("Tournament is already in watchlist", ErrorType.Conflict);
        const watchlist = await this.watchlistRepo.create(dto);
        return Result.Success(this.toUserWatchlistDto(watchlist));
    }
    
    async remove(userId: number, tournamentId: number) : Promise<Result<void>>
    {
        const item = await this.watchlistRepo.findWatchlistItem(userId, tournamentId);
        if(item.userId === 0)
            return Result.Failure("Tournament is not in watchlist", ErrorType.NotFound);
        const res = await this.watchlistRepo.delete(userId, tournamentId);
        return res? Result.Success(): Result.Failure("Couldn't remove tournament from watchlist", ErrorType.Internal);
    }
}
