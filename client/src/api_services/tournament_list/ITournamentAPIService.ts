import type { TournamentDto } from "../../models/tournament/TournamentDto";

export type ApiResponse<T> = { success: boolean; message: string; data?: T };

export interface ITournamentAPIService {
    getAll(page?: number, limit?: number): Promise<ApiResponse<{ items: TournamentDto[]; total: number }>>;
    getById(id: number): Promise<ApiResponse<TournamentDto>>;
    create(payload: Record<string, unknown>): Promise<ApiResponse<TournamentDto>>;
    update(id: number, payload: Partial<TournamentDto>): Promise<ApiResponse<void>>;
    delete(id: number): Promise<ApiResponse<void>>;
}