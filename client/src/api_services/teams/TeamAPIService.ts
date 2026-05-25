import axios from "axios";
import { readItem } from "../../helpers/local_storage";
import type { ApiResponse, ITeamAPIService } from './ITeamAPIService';
import type { TeamDto } from "../../models/team/TeamDto";
import type { UserForMembersDto } from "../../models/user/UserForMembers";
import type { IniviteDto } from "../../models/invite/InviteDto";
import type { TeamDtoGuest } from "../../models/team/TeamDtoGuest";
//import type { UserDto } from "../../models/user/UserTypes";
//import { Team } from '../../../../server/src/Domain/models/Team';
//import type { TeamDto } from "../../models/team/TeamDto";


const BASE = import.meta.env.VITE_API_URL + "teams";

const authHeader = () => {
    const token = readItem("authToken");
    return token ? {Authorization: `Bearer ${token}`} : {};
};

const err = <T>(e: unknown, fallback: string): ApiResponse<T> => ({
    success : false,
    message : axios.isAxiosError(e) ? (e.response?.data as { message?: string})?.message ?? fallback : fallback,
});

export const teamApi: ITeamAPIService ={
    async getAll(page, limit) {
        return axios.get(`${BASE}/guest/all?page=${page}&limit=${limit}`).then(r => r.data).catch(e => err(e, "Failed to get all teams"))
    },
    async getByGamerTag(page, limit){
        return axios.get(`${BASE}?page=${page}&limit=${limit}`, { headers: authHeader()})
        .then(r => r.data).catch(e => err(e, "Failed to load items"));
    },
    async create(payload){
        return axios.post<ApiResponse<TeamDto>>(BASE, payload, {headers: authHeader()})
        .then(r => r.data).catch(e => err(e, "Failed to create!"));
    },
    async delete(id){
        return axios.delete<ApiResponse<void>>(`${BASE}/${id}`, {headers: authHeader()})
        .then(r => r.data).catch(e => err(e, "Failed to delete"))
    },
    async getById(id){
        return axios.get<ApiResponse<TeamDto>>(`${BASE}/user/${id}`, {headers: authHeader()})
        .then(r => r.data).catch(e => err(e, "Failed to find by id"))
    },
    async update(id, payload){
        return axios.patch<ApiResponse<void>>(`${BASE}/${id}`, payload, {headers: authHeader()})
        .then(r => r.data).catch(e => err(e, "Failed to update"))
    },
    async getMembers(id){
        return axios.get<ApiResponse<UserForMembersDto[]>>(`${BASE}/members/${id}`, {headers: authHeader()})
        .then(r => r.data).catch(e => err(e, "Failed to get team members"))
    },
    async transferCaptainship(idTeam, idReciever){
        return axios.patch<ApiResponse<void>>(
            `${BASE}/${idTeam}/members/${idReciever}/role`,
            {},
            {headers: authHeader()}
        )
        .then(r=>r.data).catch(e => err(e, "Failed to transfer role"))
    },
    async inviteMember(teamId, username) {
        return axios.post<ApiResponse<void>>(`${BASE}/${teamId}/invite`, {userTag : username}, {headers: authHeader()})
        .then(r=> r.data).catch(e => err(e, "Failed to invite user"))
    }, 
    async userInvites() {
        return axios.get<ApiResponse<IniviteDto[]>>(`${BASE}/invites/all`, {headers: authHeader()})
        .then(r => r.data).catch(e=> err(e, "Failed to load invites"))
    },
    async inviteRespond(teamId, answer) {
        return axios.post<ApiResponse<void>>(`${BASE}/${teamId}/invite/respond`, {answer: answer}, {headers: authHeader()})
        .then(r => r.data).catch(e => err(e, "Failed to send response"))
    },
    async leaveTeam(teamId, userId){
        return axios.delete<ApiResponse<void>>(`${BASE}/${teamId}/members/${userId}`, {headers: authHeader()})
        .then(r => r.data).catch(e => err(e, "Failed to delete member"))
    },
    async getMyTeams() {
        return axios.get<ApiResponse<TeamDto>>(`${BASE}/mine/all`, {headers: authHeader()})
        .then(r => r.data).catch(e => err(e, "Failed to get your teams"))
    },
    async getTeamGuest(teamId) {
        return axios.get<ApiResponse<TeamDtoGuest>>(`${BASE}/${teamId}`)
        .then(r => r.data).catch(e => err(e, "Failed to get team for guest"))
    },
};