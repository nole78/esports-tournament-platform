import type { TournamentRegistrationDto } from "../../models/tournamentRegistration/TournamentRegistrationDto";

export type ApiResponse<T> = { success: boolean; message: string; data?: T };

export interface ITournamentRegistrationAPIService {
    getByTournamentId(id: number, page?: number, limit?: number): Promise<ApiResponse<{ items: TournamentRegistrationDto[]; total: number }>>;
    registerTournament(id: number, payload: Record<string, unknown>): Promise<ApiResponse<TournamentRegistrationDto>>;
    delete(tournamentId: number, teamId: number): Promise<ApiResponse<void>>;
    update(tournamentId: number, teamId: number, payload: Partial<TournamentRegistrationDto>): Promise<ApiResponse<void>>;
    
}