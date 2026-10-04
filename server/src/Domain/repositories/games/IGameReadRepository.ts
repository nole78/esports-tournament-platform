import { Game } from "../../models/Game";

export interface IGameReadRepository {
  findById(id: number): Promise<Game>;
  findByIds(ids: number[]): Promise<Game[]>;
  findByName(name: string): Promise<Game>;
  findAll(page?: number, limit?: number): Promise<Game[]>;
  findAllNames(): Promise<String[]>;
  getTotal():Promise<number>;
}