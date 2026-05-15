import { ErrorType } from '../../Domain/common/ErrorType';
import { Result } from '../../Domain/common/Result';
import { CreateGameDto } from '../../Domain/DTOs/games/CreateGameDto';
import { GameDto } from '../../Domain/DTOs/games/GameDto';
import { PaginatedListDto } from '../../Domain/DTOs/PaginatedListDto';
import { Game } from '../../Domain/models/Game';
import { IGameRepository } from '../../Domain/repositories/games/IGameRepository';
import { IGameService } from '../../Domain/services/games/IGameService';

export class GameService implements IGameService {
    public constructor(private readonly gameRepo : IGameRepository){}

    private toGameDto(game: Game) : GameDto{
        return new GameDto(game.gameId,game.gameName,game.gameLogotip,game.gameGenre,game.gamePlayers)
    }

    async getAll(page?: number,limit?: number) : Promise<Result<PaginatedListDto<GameDto>>>{
        const items = await this.gameRepo.findAll(page, limit);
        const total = await this.gameRepo.getTotal();
        const list = items.map(i => this.toGameDto(i))
        return Result.Success(new PaginatedListDto( list, total, page ?? 1, limit ?? 20));
    }
    async getById(id: number) : Promise<Result<GameDto>>{
        const item = await this.gameRepo.findById(id);
        if(item.gameId === 0)
            return Result.Failiure(`Game with id ${id} doesn't exist`, ErrorType.NotFound);
        return Result.Success(this.toGameDto(item));
    }
    async create(dto: CreateGameDto) : Promise<Result<GameDto>>{
        const game = await this.gameRepo.findByName(dto.gameName);
        if(game.gameId !== 0)
            return Result.Failiure("Game with same name already exists", ErrorType.Conflict);

        const created = await this.gameRepo.create(dto);
        if(created.gameId === 0) 
            return Result.Failiure("Couldn't create game", ErrorType.Internal);

        return Result.Success(this.toGameDto(created));
    }
    async update(id: number, fields: Partial<GameDto>) : Promise<Result<void>>{
        const game = await this.gameRepo.findById(id);
        if(game.gameId === 0)
            return Result.Failiure(`Game with id ${id} doesn't exist`, ErrorType.NotFound);

        const res = await this.gameRepo.update(id, fields);
        return res? Result.Success(): Result.Failiure("Couldn't update game", ErrorType.Internal);
    }
    async delete(id: number) : Promise<Result<void>>{
        const game = await this.gameRepo.findById(id);
        if(game.gameId === 0)
            return Result.Failiure(`Game with id ${id} doesn't exist`, ErrorType.NotFound);

        const res = await this.gameRepo.delete(id);
        return res? Result.Success(): Result.Failiure("Couldn't delete game", ErrorType.Internal);
    }
}