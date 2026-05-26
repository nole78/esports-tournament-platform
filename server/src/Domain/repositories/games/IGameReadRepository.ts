import { Game } from "../../models/Game";

export interface IGameReadRepository {
  findById(id: number): Promise<Game>;
  findByName(name: string): Promise<Game>;
  findAll(page?: number, limit?: number): Promise<Game[]>;
  getTotal():Promise<number>;
}