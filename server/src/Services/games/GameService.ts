import { CreateGameDto } from '../../Domain/DTOs/games/CreateGameDto';
import { GameDto } from '../../Domain/DTOs/games/GameDto';
import { PaginatedListDto } from '../../Domain/DTOs/PaginatedListDto';
import { IGameRepository } from '../../Domain/repositories/games/IGameRepository';
import { IGameService } from '../../Domain/services/games/IGameService';

export class GameService implements IGameService {
    public constructor(private readonly gameRepo : IGameRepository){}

    async getAll(page?: number,limit?: number) : Promise<PaginatedListDto<GameDto>>{
        const items = await this.gameRepo.findAll(page, limit);
        return new PaginatedListDto(items,items.length,page,limit);
    }
    async getById(id: number) : Promise<GameDto | null>{
        return this.gameRepo.findById(id);
    }
    async create(dto: CreateGameDto) : Promise<GameDto | null>{
        const created = await this.gameRepo.create(dto);
        if(created.gameId === 0) return null;
        return new GameDto(created.gameId, created.gameName, created.gameLogotip, created.gameGenre, created.gamePlayers);
    }
    async update(id: number, fields: Partial<GameDto>) : Promise<boolean>{
        return this.gameRepo.update(id, fields);
    }
    async delete(id: number) : Promise<boolean>{
        return this.gameRepo.delete(id);
    }
}