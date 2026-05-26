import { ErrorType } from '../../Domain/common/ErrorType';
import { Result } from '../../Domain/common/Result';
import { CreateGameDto } from '../../Domain/DTOs/games/CreateGameDto';
import { GameDto } from '../../Domain/DTOs/games/GameDto';
import { PaginatedListDto } from '../../Domain/DTOs/PaginatedListDto';
import { Game } from '../../Domain/models/Game';
import { IGameReadRepository } from '../../Domain/repositories/games/IGameReadRepository';
import { IGameWriteRepository } from '../../Domain/repositories/games/IGameWriteRepository';
import { IGameService } from '../../Domain/services/games/IGameService';

export class GameService implements IGameService {
    public constructor(private readonly gameReadRepo : IGameReadRepository, private readonly gameWriteRepo: IGameWriteRepository){}

    private toGameDto(game: Game) : GameDto{
        return new GameDto(game.gameId,game.gameName,game.gameLogotip,game.gameGenre,game.gamePlayers)
    }

    async getAll(page?: number,limit?: number) : Promise<Result<PaginatedListDto<GameDto>>>{
        const items = await this.gameReadRepo.findAll(page, limit);
        const total = await this.gameReadRepo.getTotal();
        const list = items.map(i => this.toGameDto(i))
        return Result.Success(new PaginatedListDto( list, total, page ?? 1, limit ?? 20));
    }
    async getById(id: number) : Promise<Result<GameDto>>{
        const item = await this.gameReadRepo.findById(id);
        if(item.gameId === 0)
            return Result.Failure(`Game with id ${id} doesn't exist`, ErrorType.NotFound);
        return Result.Success(this.toGameDto(item));
    }
    async create(dto: CreateGameDto) : Promise<Result<GameDto>>{
        const game = await this.gameReadRepo.findByName(dto.gameName);
        if(game.gameId !== 0)
            return Result.Failure("Game with same name already exists", ErrorType.Conflict);
        const created = await this.gameWriteRepo.create(new Game(0, dto.gameName, dto.gameLogotip, dto.gameGenre, dto.gamePlayers));
        if(created.gameId === 0) 
            return Result.Failure("Couldn't create game", ErrorType.Internal);

        return Result.Success(this.toGameDto(created));
    }
    async update(id: number, fields: Partial<GameDto>) : Promise<Result<void>>{
        const game = await this.gameReadRepo.findById(id);
        if(game.gameId === 0)
            return Result.Failure(`Game with id ${id} doesn't exist`, ErrorType.NotFound);

        const res = await this.gameWriteRepo.update(id, fields);
        return res? Result.Success(): Result.Failure("Couldn't update game", ErrorType.Internal);
    }
    async delete(id: number) : Promise<Result<void>>{
        const game = await this.gameReadRepo.findById(id);
        if(game.gameId === 0)
            return Result.Failure(`Game with id ${id} doesn't exist`, ErrorType.NotFound);

        const res = await this.gameWriteRepo.delete(id);
        return res? Result.Success(): Result.Failure("Couldn't delete game", ErrorType.Internal);
    }
}