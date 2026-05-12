import { CreateGameDto } from "../../DTOs/games/CreateGameDto";
import { GameDto } from "../../DTOs/games/GameDto";
import { Game } from "../../models/Game";
import { PaginatedListDto } from "../../DTOs/PaginatedListDto";


export interface IGameRepository {
  findById(id: number): Promise<GameDto | null>;
  findByName(name: string): Promise<GameDto | null>;
  findAll(page?: number, limit?: number): Promise<PaginatedListDto<GameDto>>;
  create(dto: CreateGameDto): Promise<Game>;
  update(id: number, fields: Partial<Game>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
}