import axios from "axios";
import { readItem } from "../../helpers/local_storage";
import type { IMatchAPIService } from "./IMatchAPIService";
import type { MatchDto } from "../../models/match/MatchDto";
import type { MatchDetailsDto } from "../../models/match/MatchDetailsDto";
import type { MatchPlayerDto } from "../../models/match_player/AddPlayerResponseDto";
import type { AddPlayersResponseDto } from "../../models/match_player/AddPlayerResponseDto";
import { apiError } from "../apiResponse";

const BASE = import.meta.env.VITE_API_URL + "matches";

const authHeader = () => {
    const token = readItem("authToken");
    return token ? { Authorization: `Bearer ${token}`} : {};
}

export const matchApi: IMatchAPIService = {
        async getAllForTorunament(tournamentId: number) {
            return axios.get(`${BASE}/tournament/${tournamentId}`, { headers: authHeader()})
                .then(r => r.data).catch(e => apiError<MatchDto[]>(e, "Failed to load matches"));
        },
        async getDetails(id) {
            return axios.get(`${BASE}/${id}`, {headers: authHeader()})
                .then(r => r.data).catch(e => apiError<MatchDetailsDto>(e,"Failed to load details"));
        },
        async setResult(id, payload) {
            return axios.patch(`${BASE}/${id}/result`, payload, {headers: authHeader()})
                .then(r => r.data).catch(e => apiError<void>(e,"Failed to set result"));
        },
        async getPlayers(id, teamId) {
            return axios.get(`${BASE}/${id}/players/${teamId}`, { headers: authHeader() })
                .then(r => r.data).catch(e => apiError<MatchPlayerDto[]>(e, "Failed to load players"));
        },
        async addPlayers(id, payload) {
            return axios.post(`${BASE}/${id}/players`, payload, {headers: authHeader()})
                .then(r => r.data).catch(e => apiError<AddPlayersResponseDto>(e, "Failed to add players"));
        },
        async removePlayer(id, userId) {
            return axios.delete(`${BASE}/${id}/players/${userId}`,{headers: authHeader()})
                .then(r => r.data).catch(e => apiError<void>(e, "Failed to delete player"));
        },
        async changePerformanceNotes(id, userId, payload) {
            return axios.put(`${BASE}/${id}/players/${userId}`,payload,{headers: authHeader()})
                .then(r => r.data).catch(e => apiError<void>(e, "Failed to change performance notes"));
        }
    
}