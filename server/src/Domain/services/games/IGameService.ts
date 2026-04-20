import { CreateGameDto } from "../../DTOs/games/CreateGameDto";
import { GameDto } from "../../DTOs/games/GameDto";
import { PaginatedListDto } from "../../DTOs/PaginatedListDto";


export interface IGameService{
    getAll(page?: number,limit?: number) : Promise<PaginatedListDto<GameDto>>
    getById(id: number) : Promise<GameDto | null>
    create(dto: CreateGameDto) : Promise<GameDto | null>
    update(id: number, fields: Partial<GameDto>) : Promise<boolean>
    delete(id: number) : Promise<boolean>
}