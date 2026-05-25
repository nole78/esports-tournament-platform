import { Game } from "../../models/Game";

export interface IGameRepository {
  findById(id: number): Promise<Game>;
  findByName(name: string): Promise<Game>;
  findAll(page?: number, limit?: number): Promise<Game[]>;
  create(game: Game): Promise<Game>;
  update(id: number, fields: Partial<Game>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
  getTotal():Promise<number>;
}