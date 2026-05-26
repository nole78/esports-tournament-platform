import { Game } from "../../models/Game";

export interface IGameWriteRepository {
  create(game: Game): Promise<Game>;
  update(id: number, fields: Partial<Game>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
}