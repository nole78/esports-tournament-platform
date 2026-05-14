import type { TeamDto } from "../../models/team/TeamDto";
//import { ApiResponse } from '../tournament_list/ITournamentAPIService';


export type ApiResponse<T> = {success: boolean; message: string; data?: T};

export interface ITeamAPIService {
    getByGamerTag(page: number, limit: number): Promise<ApiResponse<{items: TeamDto[], total: number}>>;
    create(payload: Record<string, unknown>): Promise<ApiResponse<TeamDto>>;
    delete(id: number): Promise<ApiResponse<void>>;
    getById(id: number): Promise<ApiResponse<TeamDto>>;
    update(id: number, payload: Partial<TeamDto>) : Promise<ApiResponse<void>>;
}