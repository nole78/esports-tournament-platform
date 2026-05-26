import { ErrorType } from '../../Domain/common/ErrorType';
import { Result } from '../../Domain/common/Result';
import { CreateUserWatchlistDto } from '../../Domain/DTOs/user_watchlists/CreateUserWatchlistDto';
import { UserWatchlistDto } from '../../Domain/DTOs/user_watchlists/UserWatchlistDto';
import { UserWatchlist } from '../../Domain/models/UserWatchlist';
import { PaginatedListDto } from '../../Domain/DTOs/PaginatedListDto';
import { IUserWatchlistReadRepository } from '../../Domain/repositories/user_watchlist/IUserWatchlistReadRepository';
import { IUserWatchlistWriteRepository } from '../../Domain/repositories/user_watchlist/IUserWatchlistWriteRepository';
import { IUserWatchlistService } from '../../Domain/services/user_watchlist/IUserWatchlistService';
import { IGameReadRepository } from '../../Domain/repositories/games/IGameReadRepository';
import { ITournamentReadRepository } from '../../Domain/repositories/tournaments/ITournamentReadRepository';
import { UserWatchlistWriteRepository } from '../../Database/repositories/user_watchlist/UserWatchlistWriteRepository';

export class UserWatchlistService implements IUserWatchlistService {
    public constructor(
        private readonly watchlistReadRepo: IUserWatchlistReadRepository,
        private readonly watchlistWriteRepo: IUserWatchlistWriteRepository, 
        private readonly tournamentReadRepo : ITournamentReadRepository, 
        private readonly gameReadRepo: IGameReadRepository
    ){}

    private async toUserWatchlistDto(watchlist: UserWatchlist) : Promise<UserWatchlistDto>{
        const tournament = await this.tournamentReadRepo.findById(watchlist.tournamentId);
        const game = await this.gameReadRepo.findById(tournament.tournamentGameId);
        return new UserWatchlistDto(
            watchlist.userId,
            watchlist.tournamentId,
            tournament.tournamentName,
            tournament.tournamentStatus,
            game.gameName,
            game.gameLogotip,
            watchlist.addedAt
        );
    }

    async getByUserId(userId: number, page?: number, limit?: number) : Promise<Result<PaginatedListDto<UserWatchlistDto>>>
    {
        const items = await this.watchlistReadRepo.findByUserId(userId, page ?? 1, limit ?? 20);
        const total = await this.watchlistReadRepo.getTotal(userId);
        const list = await Promise.all(items.map(i => this.toUserWatchlistDto(i)));
        return Result.Success(new PaginatedListDto(list, total, page ?? 1, limit ?? 20));
    }

    async findWatchListItem(userId: number, tournamentId: number): Promise<Result<boolean>>
    {
        const item = await this.watchlistReadRepo.findWatchlistItem(userId, tournamentId);
        return Result.Success(item.userId !== 0);
    }

    async add(dto: CreateUserWatchlistDto) : Promise<Result<UserWatchlistDto>>
    {
        const item = await this.watchlistReadRepo.findWatchlistItem(dto.userId, dto.tournamentId);
        if(item.userId !== 0)
            return Result.Failure("Tournament is already in watchlist", ErrorType.Conflict);
        const watchlist = await this.watchlistWriteRepo.create(dto);
        const list = await this.toUserWatchlistDto(watchlist);
        return Result.Success(list);
    }
    
    async remove(userId: number, tournamentId: number) : Promise<Result<void>>
    {
        const item = await this.watchlistReadRepo.findWatchlistItem(userId, tournamentId);
        if(item.userId === 0)
            return Result.Failure("Tournament is not in watchlist", ErrorType.NotFound);
        const res = await this.watchlistWriteRepo.delete(userId, tournamentId);
        return res? Result.Success(): Result.Failure("Couldn't remove tournament from watchlist", ErrorType.Internal);
    }
}
