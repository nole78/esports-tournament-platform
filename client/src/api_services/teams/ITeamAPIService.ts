import type { IniviteDto } from "../../models/invite/InviteDto";
import type { TeamDto } from "../../models/team/TeamDto";
import type { UserForMembersDto } from "../../models/user/UserForMembers";

//import { ApiResponse } from '../tournament_list/ITournamentAPIService';



export type ApiResponse<T> = {success: boolean; message: string; data?: T};

export interface ITeamAPIService {
    getByGamerTag(page: number, limit: number): Promise<ApiResponse<{items: TeamDto[], total: number}>>;
    create(payload: Record<string, unknown>): Promise<ApiResponse<TeamDto>>;
    delete(id: number): Promise<ApiResponse<void>>;
    getById(id: number): Promise<ApiResponse<TeamDto>>;
    update(id: number, payload: Partial<TeamDto>) : Promise<ApiResponse<void>>;
    getMembers(id: number): Promise<ApiResponse<UserForMembersDto[]>>;
    transferCaptainship(idTeam: number, idReciever: number) : Promise<ApiResponse<void>>;
    inviteMember(teamId: number, username: string) : Promise<ApiResponse<void>>;
    userInvites():Promise<ApiResponse<IniviteDto[]>>;
    inviteRespond(teamId: number, answer : string): Promise<ApiResponse<void>>;
    leaveTeam(teamId: number, userId: number): Promise<ApiResponse<void>>;
    getMyTeams():Promise<ApiResponse<TeamDto[]>>;
}