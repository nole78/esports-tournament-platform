import type { GameDto } from "../../models/game/GameDto";
import type { ApiResponse } from "../tournament_list/ITournamentAPIService";

export interface IGameAPIService {
  getAll(page?: number, limit?: number): Promise<ApiResponse<{ items: GameDto[]; total: number }>>;
  getById(id: number): Promise<ApiResponse<GameDto>>;
  create(payload: Record<string, unknown>): Promise<ApiResponse<GameDto>>;
  update(id: number, payload: Partial<GameDto>): Promise<ApiResponse<void>>;
  delete(id: number): Promise<ApiResponse<void>>;
}
