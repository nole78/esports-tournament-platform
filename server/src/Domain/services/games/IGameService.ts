import { Result } from "../../common/Result";
import { CreateGameDto } from "../../DTOs/games/CreateGameDto";
import { GameDto } from "../../DTOs/games/GameDto";
import { PaginatedListDto } from "../../DTOs/PaginatedListDto";


export interface IGameService{
    getAll(page?: number,limit?: number) : Promise<Result<PaginatedListDto<GameDto>>>
    getById(id: number) : Promise<Result<GameDto>>
    create(dto: CreateGameDto) : Promise<Result<GameDto>>
    update(id: number, fields: Partial<GameDto>) : Promise<Result<void>>
    delete(id: number) : Promise<Result<void>>
}