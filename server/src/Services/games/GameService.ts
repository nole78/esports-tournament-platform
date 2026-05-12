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

    async getAll(page?: number,limit?: number) : Promise<PaginatedListDto<GameDto>>{
        const items = await this.gameRepo.findAll(page, limit);
        const total = await this.gameRepo.getTotal();
        const list = items.map(i => this.toGameDto(i))
        return new PaginatedListDto( list, total, page ?? 1, limit ?? 20);
    }
    async getById(id: number) : Promise<GameDto | null>{
        const item = await this.gameRepo.findById(id);
        if(item.gameId === 0)
            return null;
        return this.toGameDto(item);
    }
    async create(dto: CreateGameDto) : Promise<GameDto | null>{
        const created = await this.gameRepo.create(dto);
        if(created.gameId === 0) 
            return null;
        return this.toGameDto(created);
    }
    async update(id: number, fields: Partial<GameDto>) : Promise<boolean>{
        return this.gameRepo.update(id, fields);
    }
    async delete(id: number) : Promise<boolean>{
        return this.gameRepo.delete(id);
    }
}