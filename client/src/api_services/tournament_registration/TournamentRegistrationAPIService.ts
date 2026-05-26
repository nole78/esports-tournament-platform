import axios from "axios";
import { readItem } from "../../helpers/local_storage";
import type { ApiResponse, ITournamentRegistrationAPIService } from "./ITournamentRegistrationAPIService";
import type { TournamentRegistrationDto } from "../../models/tournamentRegistration/TournamentRegistrationDto";

const BASE = import.meta.env.VITE_API_URL + "tournaments";

const authHeader = () => {
  const token = readItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const err = <T>(e: Error, fallback: string): ApiResponse<T> => ({
  success: false,
  message: axios.isAxiosError(e) ? (e.response?.data as { message?: string })?.message ?? fallback : fallback,
});

export const tournamentRegistrationApi : ITournamentRegistrationAPIService = {
    async getByTournamentId(id = 0, status, page = 1, limit = 9){
        return axios.get(`${BASE}/${id}/registered?page=${page}&limit=${limit}${status ? "&status="+status : ""}`, { headers: authHeader() })
      .then(r => r.data).catch(e => err(e, "Failed to load items"));
    },
    async registerTournament(id, payload){
        return axios.post<ApiResponse<TournamentRegistrationDto>>(`${BASE}/${id}/register`, payload, { headers: authHeader() })
      .then(r => r.data).catch(e => err(e, "Failed to create"));
    },
    async delete(tournamentId, teamId){
        return axios.delete<ApiResponse<void>>(`${BASE}/${tournamentId}/register/${teamId}`, { headers: authHeader() })
      .then(r => r.data).catch(e => err(e, "Failed to delete"));
    },
    async update(tournamentId, teamId, payload){
        return axios.patch<ApiResponse<void>>(`${BASE}/${tournamentId}/registrations/${teamId}`, payload, { headers: authHeader() })
      .then(r => r.data).catch(e => err(e, "Failed to update"));
    },
    async generateBracket(tournamentId){
        return axios.post<ApiResponse<void>>(`${BASE}/${tournamentId}/generate-bracket`,{}, { headers: authHeader() })
      .then(r=> r.data).catch(e => err(e, "Failed to generate bracket"));
    }
}

