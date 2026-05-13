import type { TeamDto } from "../../models/team/TeamDto";
//import { ApiResponse } from '../tournament_list/ITournamentAPIService';


export type ApiResponse<T> = {success: boolean; message: string; data?: T};

export interface ITeamAPIService {
    getByGamerTag(gamer_tag: string): Promise<ApiResponse<TeamDto[]>>;
    create(payload: Record<string, unknown>): Promise<ApiResponse<TeamDto>>;
    delete(id: number): Promise<ApiResponse<void>>;
    getByUserId(id: number): Promise<ApiResponse<TeamDto>>;
    update(id: number, payload: Partial<TeamDto>) : Promise<ApiResponse<void>>;
}