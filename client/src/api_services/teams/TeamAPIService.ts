import axios from "axios";
import { readItem } from "../../helpers/local_storage";
import type { ApiResponse, ITeamAPIService } from './ITeamAPIService';
import type { TeamDto } from "../../models/team/TeamDto";
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
    async getByGamerTag(){
        return axios.get<ApiResponse<TeamDto[]>>(`${BASE}`, { headers: authHeader()})
        .then(r => r.data).catch(e => err(e, "Failed to load items"));
    },
    async create(payload){
        console.log(payload);
        return axios.post<ApiResponse<TeamDto>>(BASE, payload, {headers: authHeader()})
        .then(r => r.data).catch(e => err(e, "Failed to create!"));
    },
    async delete(id){
        return axios.delete<ApiResponse<void>>(`${BASE}/${id}`, {headers: authHeader()})
        .then(r => r.data).catch(e => err(e, "Failed to delete"))
    },
    async getByUserId(id){
        return axios.get<ApiResponse<TeamDto>>(`${BASE}/${id}`, {headers: authHeader()})
        .then(r => r.data).catch(e => err(e, "Failed to find by id"))
    },
    async update(id, payload){
        return axios.patch<ApiResponse<void>>(`${BASE}/${id}`, payload, {headers: authHeader()})
        .then(r => r.data).catch(e => err(e, "Failed to update"))
    }
};